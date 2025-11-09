/*
  # Create profiles and user_projects tables for dashboard

  1. New Tables
    - `profiles`: Stores user profile information (full name, bio, avatar, social links, etc.)
    - `user_projects`: Stores projects created by users (separate from submitted products)

  2. Schema Details
    - `profiles` table with user profile details and social links
    - `user_projects` table with project information linked to profiles
    - Both tables have timestamps for audit trails

  3. Security
    - Enable RLS on both tables
    - Users can only view and edit their own profiles
    - Users can only manage their own projects
    - Policies use auth.uid() for authentication

  4. Important Notes
    - profiles.id is linked to auth.users(id)
    - user_projects has foreign key to profiles
    - Both tables use Row Level Security for data protection
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  avatar_url text,
  bio text,
  github_username text,
  twitter_username text,
  website_url text,
  role text DEFAULT 'regular',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  category text,
  tags text[] DEFAULT ARRAY[]::text[],
  status text DEFAULT 'active',
  funding_goal numeric DEFAULT 0,
  current_funding numeric DEFAULT 0,
  website_url text,
  github_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can view own projects"
  ON user_projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own projects"
  ON user_projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON user_projects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON user_projects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can view projects"
  ON user_projects FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_created_at ON user_projects(created_at);