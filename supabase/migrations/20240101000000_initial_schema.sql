-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USER PROFILES TABLE
-- =============================================
-- Extends Supabase auth.users with additional profile information
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  organization_type TEXT CHECK (organization_type IN ('lab', 'clinic', 'hospital')),
  location TEXT,
  role TEXT CHECK (role IN ('admin', 'lab_manager', 'technician')) DEFAULT 'lab_manager',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- PRODUCT CATEGORIES TABLE
-- =============================================
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO product_categories (name, description) VALUES
  ('Incubator', 'Embryo incubation systems'),
  ('Pipettes', 'Micropipettes and tips for embryo handling'),
  ('Dishes & Plates', 'Culture dishes, plates, and well systems'),
  ('Media & Solutions', 'Culture media, buffers, and solutions'),
  ('Cryopreservation', 'Freezing equipment and consumables'),
  ('Micromanipulation', 'Micromanipulation systems and tools'),
  ('Imaging Systems', 'Microscopes and imaging equipment'),
  ('Lab Consumables', 'General lab supplies and consumables'),
  ('Quality Control', 'QC testing equipment and supplies'),
  ('Other', 'Other IVF-related products');

-- Public read access for categories
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON product_categories FOR SELECT
  USING (true);

-- =============================================
-- SUPPLIERS TABLE
-- =============================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for suppliers
CREATE POLICY "Users can view own suppliers"
  ON suppliers FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert suppliers"
  ON suppliers FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own suppliers"
  ON suppliers FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own suppliers"
  ON suppliers FOR DELETE
  USING (auth.uid() = created_by);

-- =============================================
-- INQUIRIES TABLE
-- =============================================
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_category_id UUID REFERENCES product_categories(id),
  product_description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  urgency_level INTEGER CHECK (urgency_level >= 1 AND urgency_level <= 5) DEFAULT 3,
  status TEXT CHECK (status IN ('draft', 'sent', 'partial', 'completed', 'expired')) DEFAULT 'draft',
  notes TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deadline TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inquiries
CREATE POLICY "Users can view own inquiries"
  ON inquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inquiries"
  ON inquiries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inquiries"
  ON inquiries FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- INQUIRY SUPPLIERS (Junction Table)
-- =============================================
CREATE TABLE inquiry_suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_status TEXT CHECK (email_status IN ('pending', 'sent', 'delivered', 'failed')) DEFAULT 'pending',
  last_followed_up_at TIMESTAMP WITH TIME ZONE,
  response_received BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(inquiry_id, supplier_id)
);

-- Enable Row Level Security
ALTER TABLE inquiry_suppliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inquiry_suppliers
CREATE POLICY "Users can view inquiry_suppliers for their inquiries"
  ON inquiry_suppliers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = inquiry_suppliers.inquiry_id
      AND inquiries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert inquiry_suppliers"
  ON inquiry_suppliers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = inquiry_suppliers.inquiry_id
      AND inquiries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update inquiry_suppliers"
  ON inquiry_suppliers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = inquiry_suppliers.inquiry_id
      AND inquiries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete inquiry_suppliers"
  ON inquiry_suppliers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = inquiry_suppliers.inquiry_id
      AND inquiries.user_id = auth.uid()
    )
  );

-- =============================================
-- QUOTES TABLE
-- =============================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  lead_time_days INTEGER,
  validity_period TEXT,
  notes TEXT,
  pdf_url TEXT,
  manually_entered BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotes
CREATE POLICY "Users can view quotes for their inquiries"
  ON quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = quotes.inquiry_id
      AND inquiries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert quotes"
  ON quotes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = quotes.inquiry_id
      AND inquiries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update quotes"
  ON quotes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = quotes.inquiry_id
      AND inquiries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete quotes"
  ON quotes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = quotes.inquiry_id
      AND inquiries.user_id = auth.uid()
    )
  );

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('quote_received', 'all_quotes_received', 'inquiry_deadline', 'follow_up_sent')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update inquiry status based on quotes
CREATE OR REPLACE FUNCTION update_inquiry_status()
RETURNS TRIGGER AS $$
DECLARE
  total_suppliers INTEGER;
  suppliers_with_quotes INTEGER;
BEGIN
  -- Count total suppliers for this inquiry
  SELECT COUNT(*) INTO total_suppliers
  FROM inquiry_suppliers
  WHERE inquiry_id = NEW.inquiry_id;

  -- Count suppliers who have submitted quotes
  SELECT COUNT(DISTINCT supplier_id) INTO suppliers_with_quotes
  FROM quotes
  WHERE inquiry_id = NEW.inquiry_id;

  -- Update inquiry status
  IF suppliers_with_quotes = total_suppliers AND total_suppliers > 0 THEN
    UPDATE inquiries SET status = 'completed' WHERE id = NEW.inquiry_id;
  ELSIF suppliers_with_quotes > 0 THEN
    UPDATE inquiries SET status = 'partial' WHERE id = NEW.inquiry_id;
  END IF;

  -- Update response_received flag in inquiry_suppliers
  UPDATE inquiry_suppliers
  SET response_received = true
  WHERE inquiry_id = NEW.inquiry_id
  AND supplier_id = NEW.supplier_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update inquiry status when quotes are added
CREATE TRIGGER update_inquiry_status_on_quote
  AFTER INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiry_status();

-- =============================================
-- INDEXES for Performance
-- =============================================
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX idx_suppliers_created_by ON suppliers(created_by);
CREATE INDEX idx_quotes_inquiry_id ON quotes(inquiry_id);
CREATE INDEX idx_quotes_supplier_id ON quotes(supplier_id);
CREATE INDEX idx_inquiry_suppliers_inquiry_id ON inquiry_suppliers(inquiry_id);
CREATE INDEX idx_inquiry_suppliers_supplier_id ON inquiry_suppliers(supplier_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- =============================================
-- COMMENTS for Documentation
-- =============================================
COMMENT ON TABLE user_profiles IS 'Extended user profile information beyond Supabase auth';
COMMENT ON TABLE suppliers IS 'Supplier contact information managed by users';
COMMENT ON TABLE product_categories IS 'Predefined categories of IVF products';
COMMENT ON TABLE inquiries IS 'Quote requests created by users';
COMMENT ON TABLE inquiry_suppliers IS 'Junction table linking inquiries to suppliers with email tracking';
COMMENT ON TABLE quotes IS 'Supplier quotes received for inquiries';
COMMENT ON TABLE notifications IS 'User notifications for various events';

