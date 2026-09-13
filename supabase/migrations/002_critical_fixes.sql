-- ============================================================================
-- CRITICAL FIXES MIGRATION
-- Apply this in Supabase SQL Editor to fix runtime errors:
--   1. users_role_check constraint (does not include 'regular')
--   2. Stale trigger referencing dropped 'total_votes' column
--   3. Missing submit_review and ensure_user_profile RPC functions
--   4. Missing 'comment' column on reviews table
--   5. Missing FK constraint on reviews.user_id
--
-- This is SAFE to run even if some of these are already fixed (all use
-- DROP IF EXISTS / ADD COLUMN IF NOT EXISTS / CREATE OR REPLACE).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Fix users_role_check constraint — must include 'regular'
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_role_check'
    AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
  END IF;
END $$;

-- Backfill any rows that violated the old constraint
UPDATE public.users SET role = 'regular' WHERE role IS NULL OR role NOT IN ('regular', 'government', 'admin');

-- Create the fixed constraint
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('regular', 'government', 'admin'));


-- ----------------------------------------------------------------------------
-- 2. Drop stale triggers that may reference dropped columns
--    (total_votes, upvotes, downvotes)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tgname, tgrelid::regclass::text AS tbl_name
    FROM pg_trigger
    WHERE NOT tgisinternal
      AND (tgrelid = 'public.products'::regclass
           OR tgrelid = 'public.votes'::regclass
           OR tgrelid = 'public.reviews'::regclass
           OR tgrelid = 'public.pledges'::regclass
           OR tgrelid = 'public.featured_campaigns'::regclass
           OR tgrelid = 'public.comments'::regclass)
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %s', r.tgname, r.tbl_name);
  END LOOP;
END
$$;

-- Drop stale trigger functions referencing old columns
DROP FUNCTION IF EXISTS public.trg_update_votes_count() CASCADE;
DROP FUNCTION IF EXISTS public.trg_update_reviews() CASCADE;
DROP FUNCTION IF EXISTS public.trg_update_pledges() CASCADE;
DROP FUNCTION IF EXISTS public.trg_toggle_featured() CASCADE;
DROP FUNCTION IF EXISTS public.update_votes_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_votes() CASCADE;
DROP FUNCTION IF EXISTS public.update_reviews_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_reviews() CASCADE;
DROP FUNCTION IF EXISTS public.update_funding() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_funding() CASCADE;
DROP FUNCTION IF EXISTS public.update_featured() CASCADE;
DROP FUNCTION IF EXISTS public.toggle_featured() CASCADE;
DROP FUNCTION IF EXISTS public.update_votes() CASCADE;
DROP FUNCTION IF EXISTS public.recalculate_votes() CASCADE;


-- ----------------------------------------------------------------------------
-- 3. Ensure reviews table has 'comment' column and FK constraint
-- ----------------------------------------------------------------------------
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS comment text,
  ADD COLUMN IF NOT EXISTS helpful_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestametz DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_user_id_fkey'
      AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

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


-- ----------------------------------------------------------------------------
-- 4. Create the submit_review RPC function
--    Handles user upsert + review insert/upsert in a single transaction
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_review(
  p_product_id uuid,
  p_rating integer,
  p_comment text DEFAULT null,
  p_email text DEFAULT null
)
RETURNS public.reviews
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_review public.reviews%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5' USING ERRCODE = '22023';
  END IF;

  IF p_comment IS NULL OR btrim(p_comment) = '' THEN
    RAISE EXCEPTION 'comment is required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.users (id, full_name, email, role, bio, avatar_url)
  VALUES (v_user_id, 'User', p_email, 'regular', '', '')
  ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(NULLIF(public.users.full_name, ''), 'User'),
        email = COALESCE(EXCLUDED.email, public.users.email),
        updated_at = now();

  INSERT INTO public.reviews (product_id, user_id, rating, comment)
  VALUES (p_product_id, v_user_id, p_rating, p_comment)
  ON CONFLICT (product_id, user_id) DO UPDATE
    SET rating = EXCLUDED.rating,
        comment = EXCLUDED.comment
  RETURNING * INTO v_review;

  RETURN v_review;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_review(uuid, integer, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_review(uuid, integer, text, text) TO authenticated;


-- ----------------------------------------------------------------------------
-- 5. Create ensure_user_profile RPC function
--    Safely creates or updates a user profile row
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_user_id uuid,
  p_email text DEFAULT null
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.users (id, full_name, email, role, bio, avatar_url)
  VALUES (p_user_id, 'User', p_email, 'regular', '', '')
  ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(NULLIF(public.users.full_name, ''), 'User'),
        email = COALESCE(EXCLUDED.email, public.users.email),
        updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_user_profile(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(uuid, text) TO authenticated;


-- ----------------------------------------------------------------------------
-- 6. Recreate triggers with correct column names (votes_count, not total_votes)
-- ----------------------------------------------------------------------------

-- votes -> products.votes_count
CREATE OR REPLACE FUNCTION public.trg_update_votes_count()
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

CREATE TRIGGER on_votes_change
  AFTER INSERT OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION trg_update_votes_count();

-- reviews -> products.review_count + avg_rating
CREATE OR REPLACE FUNCTION public.trg_update_reviews()
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

CREATE TRIGGER on_reviews_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION trg_update_reviews();

-- pledges -> products.current_funding + pledgers_count
CREATE OR REPLACE FUNCTION public.trg_update_pledges()
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

CREATE TRIGGER on_pledges_change
  AFTER INSERT OR UPDATE OR DELETE ON public.pledges
  FOR EACH ROW EXECUTE FUNCTION trg_update_pledges();

-- featured_campaigns -> products.is_featured
CREATE OR REPLACE FUNCTION public.trg_toggle_featured()
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

CREATE TRIGGER on_campaign_change
  AFTER INSERT OR UPDATE OR DELETE ON public.featured_campaigns
  FOR EACH ROW EXECUTE FUNCTION trg_toggle_featured();


-- ----------------------------------------------------------------------------
-- 7. Create auth trigger for new users
-- ----------------------------------------------------------------------------
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

-- Backfill any auth users that don't have a profile row
INSERT INTO public.users (id, full_name, email, role, bio, avatar_url, created_at)
SELECT
  auth_user.id,
  COALESCE(auth_user.raw_user_meta_data->>'full_name', 'User'),
  auth_user.email,
  'regular',
  '',
  COALESCE(auth_user.raw_user_meta_data->>'avatar_url', ''),
  now()
FROM auth.users AS auth_user
ON CONFLICT (id) DO UPDATE
  SET full_name = COALESCE(NULLIF(public.users.full_name, ''), EXCLUDED.full_name),
      email = COALESCE(EXCLUDED.email, public.users.email),
      updated_at = now();


-- ----------------------------------------------------------------------------
-- 8. Disable RLS on users table (as per original schema — admin access in app)
-- ----------------------------------------------------------------------------
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
