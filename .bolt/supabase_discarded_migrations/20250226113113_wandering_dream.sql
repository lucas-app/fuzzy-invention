-- Add any new indexes we might need
CREATE INDEX IF NOT EXISTS idx_task_submissions_created_at ON task_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_task_submissions_updated_at ON task_submissions(updated_at);