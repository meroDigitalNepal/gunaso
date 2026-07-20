-- This migration originally performed a rename to align with the mp/MP_ID
-- naming. 001_initial_schema.sql now creates that final schema directly, so
-- this migration is a no-op — kept only so the migrations table's
-- filename-based history stays intact for environments that already applied it.
SELECT 1;
