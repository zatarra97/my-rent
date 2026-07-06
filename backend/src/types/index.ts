export type TipoSpesa = "proprietario" | "affittuario";

export type CategoriaSpesa =
  | "affitto"
  | "condominio"
  | "energia"
  | "gas"
  | "aqp"
  | "tari"
  | "assicurazione"
  | "varie";

export type TipoAllegato = "ricevuta" | "cedolino";

export interface Spesa {
  publicId: string;
  data: string; // ISO YYYY-MM-DD
  importo: number;
  descrizione: string;
  tipo: TipoSpesa;
  categoria: CategoriaSpesa;
  ricevutaUrl: string | null; // key S3 della ricevuta di pagamento (PDF)
  cedolinoUrl: string | null; // key S3 del cedolino (PDF)
}

export const TIPI: TipoSpesa[] = ["proprietario", "affittuario"];

export const CATEGORIE: CategoriaSpesa[] = [
  "affitto",
  "condominio",
  "energia",
  "gas",
  "aqp",
  "tari",
  "assicurazione",
  "varie",
];

// Mappa tipo allegato -> colonna DB (whitelist, evita SQL injection sul nome colonna)
export const COLONNA_ALLEGATO: Record<TipoAllegato, "ricevutaUrl" | "cedolinoUrl"> = {
  ricevuta: "ricevutaUrl",
  cedolino: "cedolinoUrl",
};
