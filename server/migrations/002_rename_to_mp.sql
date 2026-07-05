-- Renames the legacy `parliamentarians`/`parliamentarian_id` schema to
-- `mps`/`mp_id`.
--
-- The initial schema (001) has since been rewritten to create the `mps`/`mp_id`
-- names directly, so on a fresh database there is nothing to rename and this
-- migration must be a safe no-op. Databases created before that rewrite still
-- have the legacy `parliamentarians` table and need these renames. Guarding on
-- that table's existence lets both histories run this migration without error.
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'parliamentarians'
  ) THEN
    ALTER TABLE parliamentarians RENAME TO mps;
    ALTER TABLE users RENAME COLUMN parliamentarian_id TO mp_id;
    ALTER TABLE submissions RENAME COLUMN parliamentarian_id TO mp_id;
    ALTER INDEX idx_submissions_parliamentarian RENAME TO idx_submissions_mp;
    ALTER INDEX idx_submissions_parliamentarian_status RENAME TO idx_submissions_mp_status;
    ALTER INDEX idx_submissions_parliamentarian_created RENAME TO idx_submissions_mp_created;
  END IF;
END $$;
