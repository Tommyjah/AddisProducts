-- ============================================================================
-- AddisProducts — Complete Supabase Schema
-- Run these in order in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. PRODUCTS TABLE (the core — replaces mockProducts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_am text,
  description text NOT NULL,
  description_am text,
  image_url text,
  gallery_urls text[] DEFAULT ARRAY[]::text[],
  website_url text,
  github_url text,
  category text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  funding_goal numeric DEFAULT 0,
  current_funding numeric DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'funding', 'completed')),
  is_featured boolean DEFAULT false,
  government_only boolean DEFAULT false,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  votes_count integer DEFAULT 0,
  avg_rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  pledgers_count integer DEFAULT 0
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view products" ON products FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view products" ON products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own products" ON products FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- ============================================================================
-- 2. VOTES TABLE (one vote per user per product — no double voting)
-- ============================================================================
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view votes" ON votes FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view votes" ON votes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own vote" ON votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vote" ON votes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_votes_product_id ON votes(product_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

-- Trigger: auto-update products.votes_count
CREATE OR REPLACE FUNCTION update_product_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products SET votes_count = (
      SELECT COUNT(*) FROM votes WHERE product_id = NEW.product_id AND vote_type = 'up'
    ) WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products SET votes_count = (
      SELECT COUNT(*) FROM votes WHERE product_id = OLD.product_id AND vote_type = 'up'
    ) WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_votes_count
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_product_votes_count();

-- ============================================================================
-- 3. REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view reviews" ON reviews FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view reviews" ON reviews FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own review" ON reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own review" ON reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own review" ON reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Trigger: auto-update products.avg_rating and review_count
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products SET
      avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = NEW.product_id),
      review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE products SET
      avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = NEW.product_id),
      review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products SET
      avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = OLD.product_id),
      review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = OLD.product_id)
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ============================================================================
-- 4. PLEDGES TABLE (Phase 1: intent tracking — no real money yet)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  message text,
  status text DEFAULT 'pledged' CHECK (status IN ('pledged', 'paid', 'cancelled')),
  chapa_transaction_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view pledges" ON pledges FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view pledges" ON pledges FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own pledge" ON pledges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pledge" ON pledges FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pledge" ON pledges FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Product owner can update pledge status" ON pledges FOR UPDATE TO authenticated
  USING (
    auth.uid() = (SELECT user_id FROM products WHERE id = product_id)
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_pledges_product_id ON pledges(product_id);
CREATE INDEX IF NOT EXISTS idx_pledges_user_id ON pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_pledges_status ON pledges(status);

-- Trigger: auto-update products.current_funding from paid pledges
CREATE OR REPLACE FUNCTION update_product_funding()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products SET current_funding = (
      SELECT COALESCE(SUM(amount), 0) FROM pledges WHERE product_id = NEW.product_id AND status = 'paid'
    ) WHERE id = NEW.product_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status OR OLD.amount != NEW.amount THEN
      UPDATE products SET current_funding = (
        SELECT COALESCE(SUM(amount), 0) FROM pledges WHERE product_id = NEW.product_id AND status = 'paid'
      ) WHERE id = NEW.product_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products SET current_funding = (
      SELECT COALESCE(SUM(amount), 0) FROM pledges WHERE product_id = OLD.product_id AND status = 'paid'
    ) WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_funding
  AFTER INSERT OR UPDATE OR DELETE ON pledges
  FOR EACH ROW EXECUTE FUNCTION update_product_funding();

-- Also track number of pledgers
CREATE OR REPLACE FUNCTION update_pledgers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products SET pledgers_count = (
      SELECT COUNT(DISTINCT user_id) FROM pledges WHERE product_id = NEW.product_id AND status = 'pledged'
    ) WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products SET pledgers_count = (
      SELECT COUNT(DISTINCT user_id) FROM pledges WHERE product_id = OLD.product_id AND status = 'pledged'
    ) WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_pledgers_count
  AFTER INSERT OR DELETE ON pledges
  FOR EACH ROW EXECUTE FUNCTION update_pledgers_count();

-- ============================================================================
-- 5. COLLABORATION REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS collaboration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  message text NOT NULL,
  experience text,
  portfolio_url text,
  availability text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view collab requests" ON collaboration_requests FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view collab requests" ON collaboration_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own collab request" ON collaboration_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Product owner can update collab status" ON collaboration_requests FOR UPDATE TO authenticated
  USING (
    auth.uid() = (SELECT user_id FROM products WHERE id = product_id)
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete own collab request" ON collaboration_requests FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_collab_product_id ON collaboration_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_collab_user_id ON collaboration_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_status ON collaboration_requests(status);

-- ============================================================================
-- 6. SEED DATA — Real-looking Ethiopian products
-- ============================================================================
INSERT INTO products (id, title, title_am, description, description_am, image_url, website_url, github_url, category, tags, funding_goal, current_funding, status, is_featured, user_id, votes_count, avg_rating, review_count, pledgers_count)
VALUES
('a1111111-1111-1111-1111-111111111111', 'EthioTranslate', 'ኢትዮ ትራንስሌት',
 'AI-powered translation service for Ethiopian languages including Amharic, Oromo, and Tigrinya with high accuracy and cultural context understanding.',
 'አማርኛ፣ ኦሮምኛ እና ትግርኛን ጨምሮ የኢትዮጵያ ቋንቋዎችን ከፍተኛ ትክክለኛነት እና ባህላዊ አውድ ግንዛቤ ያለው AI-የሚመራ የትርጉም አገልግሎት።',
 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
 'https://ethiotranslate.com', 'ethiotranslate/platform',
 'AI/ML', ARRAY['AI', 'Translation', 'NLP', 'Ethiopian Languages'],
 50000, 32000, 'funding', true,
 'a1111111-1111-1111-1111-111111111111', 342, 4.8, 127, 45),

('a2222222-2222-2222-2222-222222222222', 'HabeshaMarket', 'ሀበሻ ማርኬት',
 'E-commerce platform specifically designed for Ethiopian businesses with integrated payment solutions, inventory management, and multi-language support.',
 'ለኢትዮጵያ ንግዶች በተለየ መልኩ የተቀየሰ የመስመር ላይ የንግድ መድረክ ተቀናጅተው የመክፈያ መፍትሄዎች፣ የእቃ አስተዳደር እና ብዙ ቋንቋ ድጋፍ።',
 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
 'https://habeshamarket.et', NULL,
 'FinTech', ARRAY['E-commerce', 'Payment', 'Ethiopian Business'],
 75000, 28000, 'funding', true,
 'a2222222-2222-2222-2222-222222222222', 287, 4.6, 89, 32),

('a3333333-3333-3333-3333-333333333333', 'AgriConnect Ethiopia', 'አግሪ ኮነክት ኢትዮጵያ',
 'Digital platform connecting Ethiopian farmers directly with consumers, featuring crop monitoring, weather forecasts, and fair pricing mechanisms.',
 'የኢትዮጵያ አርሶ አደሮችን በቀጥታ ከሸማቾች ጋር የሚያያይዝ ዲጂታል መድረክ፣ የሰብል ክትትል፣ የአየር ሁኔታ ትንበያ እና ፍትሃዊ የዋጋ አሰጣጥ ዘዴዎችን ያቀፈ።',
 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
 'https://agriconnect.et', NULL,
 'AgTech', ARRAY['Agriculture', 'Farmers', 'Supply Chain', 'Weather'],
 0, 0, 'active', false,
 'a1111111-1111-1111-1111-111111111111', 195, 4.4, 56, 0),

('a4444444-4444-4444-4444-444444444444', 'EthioHealth Tracker', 'ኢትዮ ጤና መከታተያ',
 'Mobile health application for rural Ethiopian communities with offline capabilities, telemedicine features, and local health worker integration.',
 'ለገጠር የኢትዮጵያ ማህበረሰቦች ከመስመር ውጪ መቻል፣ የቴሌሜዲሲን ባህሪያት እና የአካባቢ የጤና ባለሙያዎች ውህደት ያለው የሞባይል ጤና መተግበሪያ።',
 'https://images.pexels.com/photos/4021779/pexels-photo-4021779.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
 NULL, NULL,
 'HealthTech', ARRAY['Healthcare', 'Mobile', 'Telemedicine', 'Rural'],
 0, 0, 'active', false,
 'a2222222-2222-2222-2222-222222222222', 156, 4.7, 43, 0),

('a5555555-5555-5555-5555-555555555555', 'EduBirr', 'ኢዱ ብር',
 'Educational payment platform for Ethiopian schools with scholarship management, fee tracking, and parent-teacher communication tools.',
 'ለኢትዮጵያ ትምህርት ቤቶች የእድሎን አስተዳደር፣ የክፍያ መከታተያ እና የወላጅ-አስተማሪ የመግባቢያ መሳሪያዎች ያለው የትምህርት ክፍያ መድረክ።',
 'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
 NULL, NULL,
 'EdTech', ARRAY['Education', 'Payment', 'Schools', 'Ethiopia'],
 40000, 15000, 'funding', true,
 'a1111111-1111-1111-1111-111111111111', 234, 4.5, 78, 28),

('a6666666-6666-6666-6666-666666666666', 'Addis Ride', 'አዲስ ራይድ',
 'Motorcycle taxi dispatch app for Addis Ababa with real-time tracking, fair pricing, and driver verification system.',
 'ለአዲስ አበባ የሞተርሲክ ሹማ መክፈያ አፕ፣ በርዕስ-ሰኞር ትርጉም፣ ፍትሃዊ ዋጋ እና መፍጨወያ ደህንነቱ ያለው ስርዓት።',
 'https://images.pexels.com/photos/1467080/pexels-photo-1467080.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
 NULL, NULL,
 'Mobile App', ARRAY['Transport', 'Addis Ababa', 'Mobile', 'GPS'],
 30000, 8000, 'funding', false,
 'a3333333-3333-3333-3333-333333333333', 167, 4.2, 34, 15),

('a7777777-7777-7777-7777-7777777777777', 'EthioHR', 'ኢትዮ ሂአር',
 'Cloud-based HR and payroll management system built for Ethiopian labor law compliance with Amharic interface.',
 'ልክ ስራማ ህግ መታወቂያ ያለው የደሃብ እና ጦር ዝግጅት መድረክ በአማርኛ አቀራርቦ የመስመር ላይ መድረክ።',
 'https://images.pexels.com/photos/1749416/pexels-photo-1749416.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
 NULL, 'ethiohr/platform',
 'SaaS', ARRAY['HR', 'Payroll', 'SaaS', ' Ethiopian Business'],
 0, 0, 'active', false,
 'a2222222-2222-2222-2222-222222222222', 89, 4.0, 18, 0)
ON CONFLICT DO NOTHING;
