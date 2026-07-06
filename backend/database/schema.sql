-- Schema `myrent` sul RDS shared-db (account bekboard).
-- Applicare una tantum con un client MySQL, ad esempio:
--
--   CREATE DATABASE IF NOT EXISTS myrent CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--   USE myrent;
--   SOURCE schema.sql;
--   SOURCE seed.sql;   -- migrazione dei dati storici (una tantum)
--
-- (Opzionale ma consigliato) utente dedicato con permessi sul solo schema myrent:
--   CREATE USER 'myrent'@'%' IDENTIFIED BY '<password>';
--   GRANT SELECT, INSERT, UPDATE, DELETE ON myrent.* TO 'myrent'@'%';
--   FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS spese (
  id            INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  publicId      VARCHAR(36) NOT NULL UNIQUE,
  data          DATE NOT NULL,
  importo       DECIMAL(10,2) NOT NULL,
  descrizione   VARCHAR(500) NOT NULL DEFAULT '',
  tipo          ENUM('proprietario','affittuario') NOT NULL,
  categoria     ENUM('affitto','condominio','energia','gas','aqp','tari','assicurazione','varie') NOT NULL,
  ricevutaUrl   VARCHAR(500) DEFAULT NULL,  -- key S3 della ricevuta di pagamento (PDF)
  cedolinoUrl   VARCHAR(500) DEFAULT NULL,  -- key S3 del cedolino (PDF)
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_spese_data (data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
