ALTER TABLE parliamentarians RENAME TO mps;
ALTER TABLE users RENAME COLUMN parliamentarian_id TO mp_id;
ALTER TABLE submissions RENAME COLUMN parliamentarian_id TO mp_id;
ALTER INDEX idx_submissions_parliamentarian RENAME TO idx_submissions_mp;
ALTER INDEX idx_submissions_parliamentarian_status RENAME TO idx_submissions_mp_status;
ALTER INDEX idx_submissions_parliamentarian_created RENAME TO idx_submissions_mp_created;
