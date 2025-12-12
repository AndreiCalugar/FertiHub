-- Add AI extraction fields to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS ai_extracted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) NULL,
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE;

-- Add index for finding quotes that need review
CREATE INDEX IF NOT EXISTS idx_quotes_needs_review ON quotes(needs_review) WHERE needs_review = true;

-- Add index for AI extracted quotes
CREATE INDEX IF NOT EXISTS idx_quotes_ai_extracted ON quotes(ai_extracted) WHERE ai_extracted = true;

-- Comment the columns
COMMENT ON COLUMN quotes.ai_extracted IS 'Whether this quote was extracted using AI';
COMMENT ON COLUMN quotes.confidence_score IS 'AI confidence score (0.0 to 1.0)';
COMMENT ON COLUMN quotes.needs_review IS 'Whether this quote needs manual review due to low confidence';

