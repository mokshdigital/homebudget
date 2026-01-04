-- Fix RLS policies for home_invitations that can't access auth.users directly
-- Run this in Supabase SQL Editor

-- 1. Create a helper function to get current user's email
CREATE OR REPLACE FUNCTION get_my_email()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION get_my_email() TO authenticated;

-- 2. Drop old policies that reference auth.users directly
DROP POLICY IF EXISTS "Users can view their invitations" ON home_invitations;
DROP POLICY IF EXISTS "Users can respond to their invitations" ON home_invitations;

-- 3. Recreate policies using the helper function
CREATE POLICY "Users can view their invitations"
ON home_invitations FOR SELECT
USING (
  LOWER(email) = LOWER(get_my_email())
);

CREATE POLICY "Users can respond to their invitations"
ON home_invitations FOR UPDATE
USING (
  LOWER(email) = LOWER(get_my_email())
)
WITH CHECK (
  LOWER(email) = LOWER(get_my_email())
);
