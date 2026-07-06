import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler";
import healthRoutes from "./routes/health.routes";
import speseRoutes from "./routes/spese.routes";

export const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = (process.env.CORS_FRONTEND || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin not allowed — ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-App-Password"],
    credentials: true,
  })
);

app.use(express.json());

// /health è pubblica; le rotte spese applicano requirePassword al loro interno.
app.use(healthRoutes);
app.use(speseRoutes);

app.use(errorHandler);
