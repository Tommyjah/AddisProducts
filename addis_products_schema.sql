-- ============================================================================
-- AddisProduct — Perfect Production Database Schema (fully idempotent)
-- Target: Supabase project "Addis Product" (ftjzpkmwbicpdrblbftz)
-- Run in Supabase SQL Editor. Safe to re-run forever.
-- Every policy has a unique name. Every ALTER is guarded.
-- ============================================================================

-- ============================================================================
-- PHASE 0: Extension
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PHASE 1: CREATE MISSING TABLES (then ALTER)
-- ============================================================================

-- ---- users: CREATE IF NOT EXISTS ----
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  full_name text,
  bio text,
  role text DEFAULT 'regular' CHECK (role IN ('regular', 'government', 'admin')),
  avatar_url text,
  github_username text,
  twitter_username text,
  linkedin_url text,
  website_url text,
  email text,
  is_verified boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Trigger: auto-create user profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role, bio, avatar_url, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    'regular',
    '',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    now()
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---- users: ALTER existing tables — add missing columns ----
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'regular' CHECK (role IN ('regular', 'government', 'admin')),
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS github_username text,
  ADD COLUMN IF NOT EXISTS twitter_username text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- ---- products ----
ALTER TABLE public.products
  DROP COLUMN IF EXISTS total_votes,
  DROP COLUMN IF EXISTS upvotes,
  DROP COLUMN IF EXISTS downvotes;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS title_am text,
  ADD COLUMN IF NOT EXISTS description_am text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS funding_goal numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_funding numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'funding', 'completed')),
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS government_only boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS votes_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_rating numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pledgers_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Guard: only add FK if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_user_id_fkey'
    AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- ---- votes: UNIQUE constraint (idempotent) ----
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'votes_product_user_unique'
  ) THEN
    ALTER TABLE public.votes
      ADD CONSTRAINT votes_product_user_unique
      UNIQUE (product_id, user_id);
  END IF;
END
$$;

-- ---- reviews ----
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS helpful_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_product_user_unique'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_product_user_unique
      UNIQUE (product_id, user_id);
  END IF;
END
$$;

-- ---- government_proposals: add content columns ----
ALTER TABLE public.government_proposals
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS requirements text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS timeline text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ---- collaborations: add content columns ----
ALTER TABLE public.collaborations
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- ---- payments ----
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- ---- comments ----
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- ============================================================================
-- PHASE 2: NEW TABLES + their RLS (idempotent)
-- ============================================================================

-- ---- featured_campaigns ----
CREATE TABLE IF NOT EXISTS public.featured_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  duration_days integer NOT NULL CHECK (duration_days IN (7, 14, 30)),
  tier text NOT NULL CHECK (tier IN ('standard', 'premium')),
  price_etb numeric NOT NULL CHECK (price_etb > 0),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'refunded')),
  payment_id uuid REFERENCES public.payments(id),
  transaction_ref text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.featured_campaigns ENABLE ROW LEVEL SECURITY;

-- Use unique policy names — never reuse a name on the same table
DROP POLICY IF EXISTS "fc_public_view_anon" ON public.featured_campaigns;
DROP POLICY IF EXISTS "fc_public_view_auth" ON public.featured_campaigns;
DROP POLICY IF EXISTS "fc_insert_own" ON public.featured_campaigns;
DROP POLICY IF EXISTS "fc_view_own" ON public.featured_campaigns;
DROP POLICY IF EXISTS "fc_owner_update" ON public.featured_campaigns;
DROP POLICY IF EXISTS "fc_owner_cancel" ON public.featured_campaigns;

CREATE POLICY "fc_public_view_anon" ON public.featured_campaigns
  FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "fc_public_view_auth" ON public.featured_campaigns
  FOR SELECT TO authenticated USING (status = 'active');
CREATE POLICY "fc_insert_own" ON public.featured_campaigns FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fc_view_own" ON public.featured_campaigns FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "fc_owner_update" ON public.featured_campaigns FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "fc_owner_cancel" ON public.featured_campaigns FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_featured_campaigns_product_id ON public.featured_campaigns(product_id);
CREATE INDEX IF NOT EXISTS idx_featured_campaigns_user_id ON public.featured_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_featured_campaigns_status ON public.featured_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_featured_campaigns_end_date ON public.featured_campaigns(end_date);

-- ---- newsletter_subscribers ----
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  subscribed_at timestamptz DEFAULT now(),
  source text DEFAULT 'website' CHECK (source IN ('website', 'social', 'referral', 'other'))
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ns_insert_anon" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "ns_admin_view" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "ns_admin_delete" ON public.newsletter_subscribers;

CREATE POLICY "ns_insert_anon" ON public.newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "ns_admin_view" ON public.newsletter_subscribers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "ns_admin_delete" ON public.newsletter_subscribers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ---- admin_activity_log ----
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "aal_admin_view" ON public.admin_activity_log;
DROP POLICY IF EXISTS "aal_admin_insert" ON public.admin_activity_log;

CREATE POLICY "aal_admin_view" ON public.admin_activity_log FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "aal_admin_insert" ON public.admin_activity_log FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_admin_log_entity ON public.admin_activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_log_created ON public.admin_activity_log(created_at DESC);

-- ---- pledges ----
CREATE TABLE IF NOT EXISTS public.pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  message text,
  status text NOT NULL DEFAULT 'pledged' CHECK (status IN ('pledged', 'paid', 'cancelled')),
  chapa_transaction_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PHASE 3: RLS for ALL tables (drop old, recreate with unique names)
-- ============================================================================

-- ---- products ----
DROP POLICY IF EXISTS "prod_view_anon" ON public.products;
DROP POLICY IF EXISTS "prod_view_auth" ON public.products;
DROP POLICY IF EXISTS "prod_insert_auth" ON public.products;
DROP POLICY IF EXISTS "prod_update_own" ON public.products;
DROP POLICY IF EXISTS "prod_delete_own" ON public.products;

CREATE POLICY "prod_view_anon" ON public.products FOR SELECT TO anon USING (true);
CREATE POLICY "prod_view_auth" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "prod_insert_auth" ON public.products FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prod_update_own" ON public.products FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "prod_delete_own" ON public.products FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---- votes ----
DROP POLICY IF EXISTS "vote_view_anon" ON public.votes;
DROP POLICY IF EXISTS "vote_view_auth" ON public.votes;
DROP POLICY IF EXISTS "vote_insert_auth" ON public.votes;
DROP POLICY IF EXISTS "vote_delete_own" ON public.votes;

CREATE POLICY "vote_view_anon" ON public.votes FOR SELECT TO anon USING (true);
CREATE POLICY "vote_view_auth" ON public.votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "vote_insert_auth" ON public.votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vote_delete_own" ON public.votes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ---- reviews ----
DROP POLICY IF EXISTS "rev_view_anon" ON public.reviews;
DROP POLICY IF EXISTS "rev_view_auth" ON public.reviews;
DROP POLICY IF EXISTS "rev_insert_auth" ON public.reviews;
DROP POLICY IF EXISTS "rev_update_own" ON public.reviews;
DROP POLICY IF EXISTS "rev_delete_own" ON public.reviews;
DROP POLICY IF EXISTS "rev_mark_helpful" ON public.reviews;

CREATE POLICY "rev_view_anon" ON public.reviews FOR SELECT TO anon USING (true);
CREATE POLICY "rev_view_auth" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "rev_insert_auth" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rev_update_own" ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "rev_delete_own" ON public.reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "rev_mark_helpful" ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- ---- government_proposals ----
DROP POLICY IF EXISTS "govp_view_anon" ON public.government_proposals;
DROP POLICY IF EXISTS "govp_view_auth" ON public.government_proposals;
DROP POLICY IF EXISTS "govp_insert_auth" ON public.government_proposals;
DROP POLICY IF EXISTS "govp_update_own" ON public.government_proposals;
DROP POLICY IF EXISTS "govp_delete_own" ON public.government_proposals;
DROP POLICY IF EXISTS "govp_owner_update_status" ON public.government_proposals;
DROP POLICY IF EXISTS "govp_owner_review" ON public.government_proposals;

CREATE POLICY "govp_view_anon" ON public.government_proposals FOR SELECT TO anon USING (true);
CREATE POLICY "govp_view_auth" ON public.government_proposals FOR SELECT TO authenticated USING (true);
CREATE POLICY "govp_insert_auth" ON public.government_proposals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "govp_update_own" ON public.government_proposals FOR UPDATE TO authenticated
  USING (auth.uid() = submitted_by);
CREATE POLICY "govp_delete_own" ON public.government_proposals FOR DELETE TO authenticated
  USING (auth.uid() = submitted_by);
CREATE POLICY "govp_owner_update_status" ON public.government_proposals FOR UPDATE TO authenticated
  USING (
    auth.uid() = (SELECT user_id FROM public.products WHERE id = product_id)
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "govp_owner_review" ON public.government_proposals FOR UPDATE TO authenticated
  USING (
    auth.uid() = (SELECT user_id FROM public.products WHERE id = product_id)
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- collaborations ----
DROP POLICY IF EXISTS "collab_view_anon" ON public.collaborations;
DROP POLICY IF EXISTS "collab_view_auth" ON public.collaborations;
DROP POLICY IF EXISTS "collab_insert_auth" ON public.collaborations;
DROP POLICY IF EXISTS "collab_update_own" ON public.collaborations;
DROP POLICY IF EXISTS "collab_delete_own" ON public.collaborations;
DROP POLICY IF EXISTS "collab_owner_update_status" ON public.collaborations;

CREATE POLICY "collab_view_anon" ON public.collaborations FOR SELECT TO anon USING (true);
CREATE POLICY "collab_view_auth" ON public.collaborations FOR SELECT TO authenticated USING (true);
CREATE POLICY "collab_insert_auth" ON public.collaborations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collab_update_own" ON public.collaborations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "collab_delete_own" ON public.collaborations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "collab_owner_update_status" ON public.collaborations FOR UPDATE TO authenticated
  USING (
    auth.uid() = (SELECT user_id FROM public.products WHERE id = product_id)
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- pledges ----
DROP POLICY IF EXISTS "pledge_view_anon" ON public.pledges;
DROP POLICY IF EXISTS "pledge_view_auth" ON public.pledges;
DROP POLICY IF EXISTS "pledge_insert_auth" ON public.pledges;
DROP POLICY IF EXISTS "pledge_update_own" ON public.pledges;
DROP POLICY IF EXISTS "pledge_delete_own" ON public.pledges;

CREATE POLICY "pledge_view_anon" ON public.pledges FOR SELECT TO anon USING (true);
CREATE POLICY "pledge_view_auth" ON public.pledges FOR SELECT TO authenticated USING (true);
CREATE POLICY "pledge_insert_auth" ON public.pledges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pledge_update_own" ON public.pledges FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "pledge_delete_own" ON public.pledges FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pledges_product_id ON public.pledges(product_id);
CREATE INDEX IF NOT EXISTS idx_pledges_user_id ON public.pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_pledges_status ON public.pledges(status);

-- ---- payments ----
DROP POLICY IF EXISTS "pay_view_own" ON public.payments;
DROP POLICY IF EXISTS "pay_view_owner_products" ON public.payments;
DROP POLICY IF EXISTS "pay_insert_auth" ON public.payments;
DROP POLICY IF EXISTS "pay_owner_view" ON public.payments;
DROP POLICY IF EXISTS "pay_admin_manage" ON public.payments;

CREATE POLICY "pay_view_own" ON public.payments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "pay_view_owner_products" ON public.payments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.products WHERE id = product_id AND user_id = auth.uid()
  ));
CREATE POLICY "pay_insert_auth" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pay_owner_view" ON public.payments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.products WHERE id = product_id AND user_id = auth.uid()
  ));
CREATE POLICY "pay_admin_manage" ON public.payments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ---- comments ----
DROP POLICY IF EXISTS "comm_view_anon" ON public.comments;
DROP POLICY IF EXISTS "comm_view_auth" ON public.comments;
DROP POLICY IF EXISTS "comm_insert_auth" ON public.comments;
DROP POLICY IF EXISTS "comm_update_own" ON public.comments;
DROP POLICY IF EXISTS "comm_delete_own" ON public.comments;

CREATE POLICY "comm_view_anon" ON public.comments FOR SELECT TO anon USING (true);
CREATE POLICY "comm_view_auth" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comm_insert_auth" ON public.comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comm_update_own" ON public.comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "comm_delete_own" ON public.comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- PHASE 4: TRIGGERS (idempotent — CREATE OR REPLACE + DROP IF EXISTS)
-- ============================================================================

-- votes → products.votes_count
CREATE OR REPLACE FUNCTION trg_update_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.products SET
      votes_count = (SELECT COUNT(*) FROM public.votes WHERE product_id = NEW.product_id AND vote_type = 'up'),
      updated_at = now()
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.products SET
      votes_count = (SELECT COUNT(*) FROM public.votes WHERE product_id = OLD.product_id AND vote_type = 'up'),
      updated_at = now()
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_votes_change ON public.votes;
CREATE TRIGGER on_votes_change
  AFTER INSERT OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION trg_update_votes_count();

-- reviews → products.review_count + avg_rating
CREATE OR REPLACE FUNCTION trg_update_reviews()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.products SET
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = NEW.product_id),
      avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE product_id = NEW.product_id),
      updated_at = now()
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.products SET
      avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE product_id = NEW.product_id),
      updated_at = now()
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.products SET
      review_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = OLD.product_id),
      avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE product_id = OLD.product_id),
      updated_at = now()
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_reviews_change ON public.reviews;
CREATE TRIGGER on_reviews_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION trg_update_reviews();

-- pledges → products.current_funding + pledgers_count
CREATE OR REPLACE FUNCTION trg_update_pledges()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.products SET
      current_funding = (SELECT COALESCE(SUM(amount), 0) FROM public.pledges WHERE product_id = NEW.product_id AND status IN ('pledged', 'paid')),
      pledgers_count = (SELECT COUNT(DISTINCT user_id) FROM public.pledges WHERE product_id = NEW.product_id AND status IN ('pledged', 'paid')),
      updated_at = now()
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status OR OLD.amount != NEW.amount THEN
      UPDATE public.products SET
        current_funding = (SELECT COALESCE(SUM(amount), 0) FROM public.pledges WHERE product_id = NEW.product_id AND status IN ('pledged', 'paid')),
        pledgers_count = (SELECT COUNT(DISTINCT user_id) FROM public.pledges WHERE product_id = NEW.product_id AND status IN ('pledged', 'paid')),
        updated_at = now()
      WHERE id = NEW.product_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.products SET
      current_funding = (SELECT COALESCE(SUM(amount), 0) FROM public.pledges WHERE product_id = OLD.product_id AND status IN ('pledged', 'paid')),
      pledgers_count = (SELECT COUNT(DISTINCT user_id) FROM public.pledges WHERE product_id = OLD.product_id AND status IN ('pledged', 'paid')),
      updated_at = now()
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_pledges_change ON public.pledges;
CREATE TRIGGER on_pledges_change
  AFTER INSERT OR UPDATE OR DELETE ON public.pledges
  FOR EACH ROW EXECUTE FUNCTION trg_update_pledges();

-- featured_campaigns → products.is_featured
CREATE OR REPLACE FUNCTION trg_toggle_featured()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.products SET
      is_featured = true,
      updated_at = now()
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'completed' OR NEW.status = 'cancelled' OR NEW.status = 'refunded' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.featured_campaigns
        WHERE product_id = NEW.product_id AND status = 'active'
      ) THEN
        UPDATE public.products SET
          is_featured = false,
          updated_at = now()
        WHERE id = NEW.product_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.featured_campaigns
      WHERE product_id = OLD.product_id AND status = 'active'
    ) THEN
      UPDATE public.products SET
        is_featured = false,
        updated_at = now()
      WHERE id = OLD.product_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_campaign_change ON public.featured_campaigns;
CREATE TRIGGER on_campaign_change
  AFTER INSERT OR UPDATE OR DELETE ON public.featured_campaigns
  FOR EACH ROW EXECUTE FUNCTION trg_toggle_featured();

-- ============================================================================
-- PHASE 5: SEED DATA (idempotent — ON CONFLICT DO NOTHING)
-- ============================================================================

DO $$
DECLARE
  seed_user_id uuid;
BEGIN
  SELECT id INTO seed_user_id FROM public.users LIMIT 1;

  IF seed_user_id IS NULL THEN
    INSERT INTO public.users (id, full_name, email, role, bio, created_at)
    VALUES (
      '11111111-1111-1111-1111-111111111111',
      'Thomas Debebe',
      'tomiti2552@gmail.com',
      'admin',
      'Founder of AddisProduct — Ethiopian tech platform builder.',
      now()
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO seed_user_id;
  END IF;

  IF seed_user_id IS NULL THEN
    SELECT id INTO seed_user_id FROM public.users LIMIT 1;
  END IF;

  IF seed_user_id IS NULL THEN
    RAISE NOTICE 'No users found and seed user creation failed. Skipping product seed.';
    RETURN;
  END IF;

  INSERT INTO public.products (
    id, user_id, title, title_am, description, description_am, image_url,
    website_url, github_url, category, tags, funding_goal, current_funding,
    status, is_featured, created_at
  )
  VALUES
  ('a1111111-1111-1111-1111-111111111111', seed_user_id, 'EthioTranslate', 'ኢትዮ ትራንስሌት',
   'AI-powered translation service for Ethiopian languages including Amharic, Oromo, and Tigrinya with high accuracy and cultural context understanding.',
   'አማርኛ፣ ኦሮምኛ እና ትግርኛን ጨምሮ የኢትዮጵያ ቋንቋዎችን ከፍተኛ ትክክለኛነት እና ባህላዊ አውድ ግንዛቤ ያለው AI-የሚመራ የትርጉም አገልግሎት።',
   'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
   'https://ethiotranslate.com', 'ethiotranslate/platform', 'AI/ML',
   ARRAY['AI', 'Translation', 'NLP', 'Ethiopian Languages'], 50000, 32000, 'funding', true, now()),

  ('a2222222-2222-2222-2222-222222222222', seed_user_id, 'HabeshaMarket', 'ሀበሻ ማርኬት',
   'E-commerce platform specifically designed for Ethiopian businesses with integrated payment solutions, inventory management, and multi-language support.',
   'ለኢትዮጵያ ንግዶች በተለየ መልኩ የተቀየሰ የመስመር ላይ የንግድ መድረክ ተቀናጅተው የመክፈያ መፍትሄዎች፣ የእቃ አስተዳደር እና ብዙ ቋንቋ ድጋፍ።',
   'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
   'https://habeshamarket.et', NULL, 'FinTech',
   ARRAY['E-commerce', 'Payment', 'Ethiopian Business'], 75000, 28000, 'funding', true, now()),

  ('a3333333-3333-3333-3333-333333333333', seed_user_id, 'AgriConnect Ethiopia', 'አግሪ ኮነክት ኢትዮጵያ',
   'Digital platform connecting Ethiopian farmers directly with consumers, featuring crop monitoring, weather forecasts, and fair pricing mechanisms.',
   'የኢትዮጵያ አርሶ አደሮችን በቀጥታ ከሸማቾች ጋር የሚያያይዝ ዲጂታል መድረክ፣ የሰብል ክትትል፣ የአየር ሁኔታ ትንበያ እና ፍትሃዊ የዋጋ አሰጣጥ ዘዴዎችን ያቀፈ።',
   'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
   'https://agriconnect.et', NULL, 'AgTech',
   ARRAY['Agriculture', 'Farmers', 'Supply Chain', 'Weather'], 0, 0, 'active', false, now()),

  ('a4444444-4444-4444-4444-444444444444', seed_user_id, 'EthioHealth Tracker', 'ኢትዮ ጤና መከታተያ',
   'Mobile health application for rural Ethiopian communities with offline capabilities, telemedicine features, and local health worker integration.',
   'ለገጠር የኢትዮጵያ ማህበረሰቦች ከመስመር ውጪ መቻል፣ የቴሌሜዲሲን ባህሪያት እና የአካባቢ የጤና ባለሙያዎች ውህደት ያለው የሞባይል ጤና መተግበሪያ።',
   'https://images.pexels.com/photos/4021779/pexels-photo-4021779.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
   NULL, NULL, 'HealthTech',
   ARRAY['Healthcare', 'Mobile', 'Telemedicine', 'Rural'], 0, 0, 'active', false, now()),

  ('a5555555-5555-5555-5555-555555555555', seed_user_id, 'EduBirr', 'ኢዱ ብር',
   'Educational payment platform for Ethiopian schools with scholarship management, fee tracking, and parent-teacher communication tools.',
   'ለኢትዮጵያ ትምህርት ቤቶች የእድሎን አስተዳደር፣ የክፍያ መከታተያ እና የወላጅ-አስተማሪ የመግባቢያ መሳሪያዎች ያለው የትምህርት ክፍያ መድረክ።',
   'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
   NULL, NULL, 'EdTech',
   ARRAY['Education', 'Payment', 'Schools', 'Ethiopia'], 40000, 15000, 'funding', true, now()),

  ('a6666666-6666-6666-6666-666666666666', seed_user_id, 'Addis Ride', 'አዲስ ራይድ',
   'Motorcycle taxi dispatch app for Addis Ababa with real-time tracking, fair pricing, and driver verification system.',
   'ለአዲስ አበባ የሞተርሲክ ሹማ መክፈያ አፕ፣ በርዕስ-ሰኞር ትርጉም፣ ፍትሃዊ ዋጋ እና መፍጨወያ ደህንነቱ ያለው ስርዓት።',
   'https://images.pexels.com/photos/1467080/pexels-photo-1467080.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
   NULL, NULL, 'Mobile App',
   ARRAY['Transport', 'Addis Ababa', 'Mobile', 'GPS'], 30000, 8000, 'funding', false, now()),

  ('a7777777-7777-7777-7777-777777777777', seed_user_id, 'EthioHR', 'ኢትዮ ሂአር',
   'Cloud-based HR and payroll management system built for Ethiopian labor law compliance with Amharic interface.',
   'ልክ ስራማ ህግ መታወቂያ ያለው የደሃብ እና ጦር ዝግጅት መድረክ በአማርኛ አቀራርቦ የመስመር ላይ መድረክ።',
   'https://images.pexels.com/photos/1749416/pexels-photo-1749416.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
   NULL, 'ethiohr/platform', 'SaaS',
   ARRAY['HR', 'Payroll', 'SaaS', 'Ethiopian Business'], 0, 0, 'active', false, now())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.government_proposals (
    id, product_id, submitted_by, title, description, status,
    bid_amount, notes, category, timeline, requirements, created_at
  )
  VALUES
  ('61111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', seed_user_id,
   'National Digital ID Platform',
   'A secure digital identity management system for Ethiopian citizens, integrated with mobile networks and supporting offline verification for rural areas.',
   'submitted', 120000,
   'Priority initiative per Ministry of Innovation directive. Must comply with Ethiopian data protection regulations.',
   'GovTech', '12-18 months',
   ARRAY['Biometric authentication support', 'Offline verification capability', 'Integration with mobile network operators',
         'Multi-language interface (Amharic, English, Oromo)', 'Role-based access control for government agencies',
         'Audit trail and activity logging', 'API for third-party service integration', 'Scalable to 100M+ users'], now()),

  ('62222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', seed_user_id,
   'Electronic Tax Filing & Payment System',
   'End-to-end electronic tax filing platform for Ethiopian businesses and individuals, with integrated payment gateway supporting Telebirr and CBBEko.',
   'submitted', 85000,
   'Ethiopian Revenue and Customs Service has requested proposals for digital tax filing. Phase 1 targets Addis Ababa businesses.',
   'FinTech', '9-12 months',
   ARRAY['Business and individual tax filing workflows', 'Integration with Telebirr and CBBEko payment gateways',
         'Automated tax calculation based on Ethiopian tax code', 'Document upload and verification',
         'Notification system via SMS and email', 'Admin dashboard for ERC officials',
         'PDF generation for filed returns', 'Multi-year filing history'], now()),

  ('63333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', seed_user_id,
   'Rural Health Clinic Data Management System',
   'Offline-first data collection and management system for rural health clinics across Ethiopia, with sync capability when connectivity is available.',
   'under_review', 60000,
   'Ministry of Health is piloting in 5 regions. Must work with limited internet connectivity and low-end Android devices.',
   'HealthTech', '6-9 months',
   ARRAY['Offline-first data collection on Android', 'Sync when connectivity available',
         'Support for Amharic, Oromo, Tigrinya interfaces', 'Patient record management',
         'Vaccination tracking', 'Maternal health monitoring', 'Supply inventory management',
         'Report generation for regional health bureaus', 'Works on low-end Android devices (API 21+)',
         'Data encryption at rest and in transit'], now())
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Seed complete: % products, % proposals.',
    (SELECT COUNT(*) FROM public.products WHERE id::text LIKE 'a_______'),
    (SELECT COUNT(*) FROM public.government_proposals WHERE id::text LIKE '6_______');
END $$;

-- ============================================================================
-- PHASE 6: INDEXES (all idempotent)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_language ON public.products(language_preference);

CREATE INDEX IF NOT EXISTS idx_votes_product_id ON public.votes(product_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_gov_proposals_product_id ON public.government_proposals(product_id);
CREATE INDEX IF NOT EXISTS idx_gov_proposals_submitted_by ON public.government_proposals(submitted_by);
CREATE INDEX IF NOT EXISTS idx_gov_proposals_status ON public.government_proposals(status);
CREATE INDEX IF NOT EXISTS idx_gov_proposals_created ON public.government_proposals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_collab_product_id ON public.collaborations(product_id);
CREATE INDEX IF NOT EXISTS idx_collab_user_id ON public.collaborations(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_status ON public.collaborations(status);

CREATE INDEX IF NOT EXISTS idx_pledges_product_id ON public.pledges(product_id);
CREATE INDEX IF NOT EXISTS idx_pledges_user_id ON public.pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_pledges_status ON public.pledges(status);

CREATE INDEX IF NOT EXISTS idx_payments_product_id ON public.payments(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_comments_product_id ON public.comments(product_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

CREATE INDEX IF NOT EXISTS idx_featured_product_id ON public.featured_campaigns(product_id);
CREATE INDEX IF NOT EXISTS idx_featured_user_id ON public.featured_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_featured_status ON public.featured_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_featured_end_date ON public.featured_campaigns(end_date);

-- ============================================================================
-- PHASE 7: STORAGE POLICIES (requires a bucket named "products" to exist)
-- Create the "products" bucket in Supabase Dashboard → Storage before applying.
-- ============================================================================

DROP POLICY IF EXISTS "storage_products_select_anon" ON storage.objects;
DROP POLICY IF EXISTS "storage_products_select_auth" ON storage.objects;
DROP POLICY IF EXISTS "storage_products_insert_auth" ON storage.objects;
DROP POLICY IF EXISTS "storage_products_update_own" ON storage.objects;
DROP POLICY IF EXISTS "storage_products_delete_own" ON storage.objects;

CREATE POLICY "storage_products_select_anon" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'products');
CREATE POLICY "storage_products_select_auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'products');
CREATE POLICY "storage_products_insert_auth" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "storage_products_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "storage_products_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1]);
