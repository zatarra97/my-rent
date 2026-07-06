import { Router, Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPool } from "../db/pool";
import { createHttpError } from "../middleware/error-handler";
import { requirePassword } from "../middleware/auth";
import {
  Spesa,
  TipoAllegato,
  TIPI,
  CATEGORIE,
  COLONNA_ALLEGATO,
} from "../types";

const router = Router();

// Tutte le rotte delle spese richiedono la password condivisa.
router.use(requirePassword);

// ---------------------------------------------------------------------------
// Helper S3
// ---------------------------------------------------------------------------
function getS3Client(): S3Client {
  return new S3Client({ region: process.env.S3_REGION ?? "eu-north-1" });
}

function getBucket(): string {
  const bucket = process.env.S3_ALLEGATI_BUCKET;
  if (!bucket) throw new Error("S3_ALLEGATI_BUCKET env var not set");
  return bucket;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

// ---------------------------------------------------------------------------
// Helper query / mapping
// ---------------------------------------------------------------------------
const SELECT_COLS =
  "publicId, DATE_FORMAT(data, '%Y-%m-%d') AS data, importo, descrizione, tipo, categoria, ricevutaUrl, cedolinoUrl";

function rowToSpesa(row: RowDataPacket): Spesa {
  return {
    publicId: row.publicId,
    data: row.data,
    importo: Number(row.importo),
    descrizione: row.descrizione ?? "",
    tipo: row.tipo,
    categoria: row.categoria,
    ricevutaUrl: row.ricevutaUrl ?? null,
    cedolinoUrl: row.cedolinoUrl ?? null,
  };
}

interface DatiSpesa {
  data: string;
  importo: number;
  descrizione: string;
  tipo: string;
  categoria: string;
}

function validaCorpoSpesa(body: any): DatiSpesa {
  const { data, importo, descrizione, tipo, categoria } = body || {};

  if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw createHttpError(400, "Campo 'data' non valido (atteso formato YYYY-MM-DD).");
  }
  const importoNum = typeof importo === "number" ? importo : Number(importo);
  if (!Number.isFinite(importoNum) || importoNum < 0) {
    throw createHttpError(400, "Campo 'importo' non valido.");
  }
  if (!TIPI.includes(tipo)) {
    throw createHttpError(400, `Campo 'tipo' non valido. Ammessi: ${TIPI.join(", ")}`);
  }
  if (!CATEGORIE.includes(categoria)) {
    throw createHttpError(400, `Campo 'categoria' non valido. Ammessi: ${CATEGORIE.join(", ")}`);
  }

  return {
    data,
    importo: importoNum,
    descrizione: typeof descrizione === "string" ? descrizione : "",
    tipo,
    categoria,
  };
}

async function trovaSpesa(publicId: string): Promise<RowDataPacket> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, ${SELECT_COLS} FROM spese WHERE publicId = ? LIMIT 1`,
    [publicId]
  );
  if (!rows.length) throw createHttpError(404, "Spesa non trovata.");
  return rows[0];
}

function validaTipoAllegato(tipo: string): TipoAllegato {
  if (tipo !== "ricevuta" && tipo !== "cedolino") {
    throw createHttpError(400, "Tipo allegato non valido (ammessi: ricevuta, cedolino).");
  }
  return tipo;
}

// ---------------------------------------------------------------------------
// CRUD spese
// ---------------------------------------------------------------------------

// GET /spese — lista completa
router.get("/spese", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${SELECT_COLS} FROM spese ORDER BY data ASC, id ASC`
    );
    res.json(rows.map(rowToSpesa));
  } catch (err) {
    next(err);
  }
});

// POST /spese — crea
router.post("/spese", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dati = validaCorpoSpesa(req.body);
    const publicId = randomUUID();
    const pool = getPool();
    await pool.execute<ResultSetHeader>(
      "INSERT INTO spese (publicId, data, importo, descrizione, tipo, categoria) VALUES (?, ?, ?, ?, ?, ?)",
      [publicId, dati.data, dati.importo, dati.descrizione, dati.tipo, dati.categoria]
    );
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${SELECT_COLS} FROM spese WHERE publicId = ? LIMIT 1`,
      [publicId]
    );
    res.status(201).json(rowToSpesa(rows[0]));
  } catch (err) {
    next(err);
  }
});

// PUT /spese/:publicId — aggiorna
router.put("/spese/:publicId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await trovaSpesa(req.params.publicId);
    const dati = validaCorpoSpesa(req.body);
    const pool = getPool();
    await pool.execute(
      "UPDATE spese SET data = ?, importo = ?, descrizione = ?, tipo = ?, categoria = ? WHERE publicId = ?",
      [dati.data, dati.importo, dati.descrizione, dati.tipo, dati.categoria, req.params.publicId]
    );
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${SELECT_COLS} FROM spese WHERE publicId = ? LIMIT 1`,
      [req.params.publicId]
    );
    res.json(rowToSpesa(rows[0]));
  } catch (err) {
    next(err);
  }
});

// DELETE /spese/:publicId — elimina (record + allegati S3)
router.delete("/spese/:publicId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const spesa = await trovaSpesa(req.params.publicId);
    const keys = [spesa.ricevutaUrl, spesa.cedolinoUrl].filter(Boolean) as string[];
    if (keys.length) {
      const s3 = getS3Client();
      await Promise.all(
        keys.map((Key) => s3.send(new DeleteObjectCommand({ Bucket: getBucket(), Key })))
      );
    }
    await getPool().execute("DELETE FROM spese WHERE publicId = ?", [req.params.publicId]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// Allegati PDF (ricevuta di pagamento / cedolino) — bucket S3 privato
// ---------------------------------------------------------------------------

// POST /spese/:publicId/allegati/:tipo/upload-url — presigned PUT
router.post(
  "/spese/:publicId/allegati/:tipo/upload-url",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tipo = validaTipoAllegato(req.params.tipo);
      const { filename, contentType } = req.body || {};
      if (!filename || typeof filename !== "string") {
        throw createHttpError(400, "Campo 'filename' obbligatorio.");
      }
      if (contentType !== "application/pdf") {
        throw createHttpError(400, "Sono ammessi solo file PDF (application/pdf).");
      }

      const spesa = await trovaSpesa(req.params.publicId);
      const colonna = COLONNA_ALLEGATO[tipo];

      // Se esiste già un allegato dello stesso tipo, lo si rimuove da S3.
      const vecchiaKey = spesa[colonna] as string | null;

      const key = `spese/${req.params.publicId}/${tipo}-${Date.now()}-${sanitizeFilename(filename)}`;
      const s3 = getS3Client();
      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({ Bucket: getBucket(), Key: key, ContentType: contentType }),
        { expiresIn: 600 }
      );

      await getPool().execute(`UPDATE spese SET ${colonna} = ? WHERE publicId = ?`, [
        key,
        req.params.publicId,
      ]);

      if (vecchiaKey && vecchiaKey !== key) {
        await s3
          .send(new DeleteObjectCommand({ Bucket: getBucket(), Key: vecchiaKey }))
          .catch((e) => console.error("Impossibile eliminare il vecchio allegato:", e));
      }

      res.json({ uploadUrl, key });
    } catch (err) {
      next(err);
    }
  }
);

// GET /spese/:publicId/allegati/:tipo/download-url — presigned GET
router.get(
  "/spese/:publicId/allegati/:tipo/download-url",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tipo = validaTipoAllegato(req.params.tipo);
      const spesa = await trovaSpesa(req.params.publicId);
      const key = spesa[COLONNA_ALLEGATO[tipo]] as string | null;
      if (!key) throw createHttpError(404, "Nessun allegato di questo tipo per la spesa.");

      const s3 = getS3Client();
      const downloadUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: getBucket(), Key: key }),
        { expiresIn: 900 }
      );
      res.json({ downloadUrl });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /spese/:publicId/allegati/:tipo — elimina allegato
router.delete(
  "/spese/:publicId/allegati/:tipo",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tipo = validaTipoAllegato(req.params.tipo);
      const spesa = await trovaSpesa(req.params.publicId);
      const colonna = COLONNA_ALLEGATO[tipo];
      const key = spesa[colonna] as string | null;
      if (key) {
        const s3 = getS3Client();
        await s3.send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
      }
      await getPool().execute(`UPDATE spese SET ${colonna} = NULL WHERE publicId = ?`, [
        req.params.publicId,
      ]);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
