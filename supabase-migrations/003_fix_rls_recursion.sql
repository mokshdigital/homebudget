-- =====================================================
-- FIX: RESOLVE INFINITE RECURSION IN RLS POLICIES
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create a secure function to get the current user's home IDs
-- This function runs as the database owner (SECURITY DEFINER), bypassing RLS
-- enabling us to check permissions without triggering an infinite loop.
CREATE OR REPLACE FUNCTION get_auth_user_home_ids()
RETURNS TABLE (home_id UUID) 
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT home_id FROM home_members WHERE user_id = auth.uid();
$$;

-- 2. Create a helper for Owner checks too
CREATE OR REPLACE FUNCTION get_auth_user_owned_home_ids()
RETURNS TABLE (home_id UUID) 
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner';
$$;

-- 3. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Users can view home members" ON home_members;
DROP POLICY IF EXISTS "Owners can add members" ON home_members;
DROP POLICY IF EXISTS "Owners can remove members" ON home_members;

DROP POLICY IF EXISTS "Users can view their homes" ON homes;
DROP POLICY IF EXISTS "Owners can update homes" ON homes;
DROP POLICY IF EXISTS "Owners can delete homes" ON homes;

-- 4. Re-create policies using the secure functions

-- === HOME MEMBERS POLICIES ===

-- View: Uses function to avoid recursion
CREATE POLICY "Users can view home members"
ON home_members FOR SELECT
USING (
  home_id IN (SELECT home_id FROM get_auth_user_home_ids())
);

-- Add: Owners can add, or Users can add themselves (for new homes/joining)
CREATE POLICY "Owners can add members"
ON home_members FOR INSERT
WITH CHECK (
  home_id IN (SELECT home_id FROM get_auth_user_owned_home_ids())
  OR user_id = auth.uid()
);

-- Remove: Only owners can remove
CREATE POLICY "Owners can remove members"
ON home_members FOR DELETE
USING (
  home_id IN (SELECT home_id FROM get_auth_user_owned_home_ids())
);

-- === HOMES POLICIES ===

-- View: Using secure function
CREATE POLICY "Users can view their homes"
ON homes FOR SELECT
USING (
  id IN (SELECT home_id FROM get_auth_user_home_ids())
);

-- Update: Owners only
CREATE POLICY "Owners can update homes"
ON homes FOR UPDATE
USING (
  id IN (SELECT home_id FROM get_auth_user_owned_home_ids())
);

-- Delete: Owners only
CREATE POLICY "Owners can delete homes"
ON homes FOR DELETE
USING (
  id IN (SELECT home_id FROM get_auth_user_owned_home_ids())
);

-- =====================================================
-- OPTIONAL: UPDATE DATA TABLES TO BE FASTER
-- (Replacing subqueries with function calls improves performance)
-- =====================================================

-- Example for transactions (you can run this pattern for all tables if you wish, 
-- but fixing home_members above solves the critical error)

DROP POLICY IF EXISTS "Home members can view transactions" ON transactions;
CREATE POLICY "Home members can view transactions"
ON transactions FOR SELECT
USING (home_id IN (SELECT home_id FROM get_auth_user_home_ids()));

-- =====================================================
-- DONE!
-- =====================================================
