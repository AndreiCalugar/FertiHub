-- Add deadline column to inquiries table
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS deadline_date TIMESTAMPTZ;

-- Add index for deadline queries
CREATE INDEX IF NOT EXISTS idx_inquiries_deadline ON inquiries(deadline_date, status);

COMMENT ON COLUMN inquiries.deadline_date IS 'Optional deadline for receiving quotes';

