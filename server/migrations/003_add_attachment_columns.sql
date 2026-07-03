ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS attachment_file_name    TEXT,
  ADD COLUMN IF NOT EXISTS attachment_content_type TEXT,
  ADD COLUMN IF NOT EXISTS attachment_size_bytes   INTEGER,
  ADD COLUMN IF NOT EXISTS attachment_blob_path    TEXT;
