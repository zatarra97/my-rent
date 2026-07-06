# myRent

Monorepo per la gestione delle spese di affitto: SPA React (frontend) + backend serverless su AWS Lambda, con dati su MySQL (RDS shared-db) e allegati PDF su S3.

## Struttura

```
my-rent/
├── webapp/     Frontend React 19 + Vite + Tailwind (deploy su S3 + CloudFront)
├── backend/    Backend Express su Lambda + Pulumi (infra/) + schema DB (database/)
└── .github/workflows/
    ├── deploy-frontend.yml   trigger su webapp/**   → build + s3 sync + invalidazione CloudFront
    └── deploy-backend.yml    trigger su backend/**  → esbuild + update Lambda
```

## Architettura

- **Frontend**: S3 privato + CloudFront (OAC). Base path `/`.
- **Backend**: API Gateway HTTP → Lambda (Express). Auth a password condivisa (header `Authorization: Bearer <password>`), validata dal middleware `requirePassword`.
- **Database**: schema `myrent` su RDS shared-db (account `bekboard`). Nessuna risorsa RDS creata da questo progetto.
- **Allegati**: bucket S3 privato `myrent-allegati-zatarra97`; upload/download via presigned URL (PUT/GET). Due allegati PDF per spesa: ricevuta di pagamento e cedolino.
- **Infra e account**: Lambda + bucket su account `personal`; state Pulumi su `s3://pulumi-state-personal-834732842596`. Vedi `../RECAP.md`.

## Sviluppo locale

Backend:
```bash
cd backend
cp .env.example .env   # compilare DB_PASSWORD, APP_PASSWORD
npm install
npm run dev            # http://localhost:3010
```

Frontend:
```bash
cd webapp
npm install
npm run start          # Vite dev server; usa VITE_BACKEND_URL da .env
```

## Deploy iniziale (una tantum)

1. Creare lo schema `myrent` sul RDS shared-db e applicare `backend/database/schema.sql` + `seed.sql`.
2. Configurare i secret Pulumi:
   ```bash
   cd backend/infra
   npm install
   pulumi stack init prod
   pulumi -s prod config set --secret myrent:dbPassword <password-shared-db>
   pulumi -s prod config set --secret myrent:appPassword <password-app>
   aws sso login --profile personal
   pulumi -s prod up
   ```
3. Aggiornare `myrent:allowedOrigins` con l'URL CloudFront reale e ri-eseguire `pulumi up` (CORS).
4. Push su `main`: i workflow builda­no e deployano frontend e backend. Pulumi inietta automaticamente i secret GitHub (chiavi CI, nomi risorse, `VITE_BACKEND_URL`) sul repo `my-rent`.
