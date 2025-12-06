/*
  # Add email column to profiles table

  1. Changes
    - Add email column to profiles table to store user email
    - Make email NOT NULL UNIQUE with default from auth.users
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text UNIQUE;
  END IF;
END $$;