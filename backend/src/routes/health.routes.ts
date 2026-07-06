import { Router } from "express";

const router = Router();

// Health check — pubblica (nessuna auth).
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default router;
