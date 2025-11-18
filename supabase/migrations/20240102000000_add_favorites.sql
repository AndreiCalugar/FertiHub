-- Add is_favorite column to suppliers table
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_suppliers_is_favorite ON suppliers(created_by, is_favorite);

COMMENT ON COLUMN suppliers.is_favorite IS 'Marks supplier as favorite for quick access';

