-- =====================================================
-- FIX: ALLOW USERS TO CREATE NEW HOMES
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Drop the existing insert policy if it exists (it might be restrictive)
DROP POLICY IF EXISTS "Users can create homes" ON homes;

-- 2. Create a permissive policy for creating homes
-- This allows ANY authenticated user to insert a home, as long as they set themselves as the creator
CREATE POLICY "Users can create homes"
ON homes FOR INSERT
WITH CHECK (
  auth.uid() = created_by
);

-- 3. Also ensure users can View/Select the home they just created
-- We need to check if the user is the CREATOR (even if not yet a member)
DROP POLICY IF EXISTS "Users can view their homes" ON homes;

CREATE POLICY "Users can view their homes"
ON homes FOR SELECT
USING (
  id IN (SELECT home_id FROM get_auth_user_home_ids()) -- Is a member
  OR 
  created_by = auth.uid() -- OR Is the creator (for the brief moment before adding self as member)
);

-- =====================================================
-- DONE!
-- =====================================================
