import { Request, Response, NextFunction } from "express";
import { createHttpError } from "./error-handler";

/**
 * Autenticazione a password condivisa.
 * Il client invia la password come `Authorization: Bearer <password>`
 * (in alternativa nell'header `X-App-Password`). Viene confrontata con
 * la env var APP_PASSWORD, iniettata da Pulumi come secret in Lambda.
 */
export function requirePassword(req: Request, _res: Response, next: NextFunction): void {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    next(createHttpError(500, "APP_PASSWORD non configurata"));
    return;
  }

  const authHeader = req.header("authorization") || "";
  const bearer = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const provided = bearer || req.header("x-app-password") || "";

  if (!provided || provided !== expected) {
    next(createHttpError(401, "Non autorizzato"));
    return;
  }

  next();
}
