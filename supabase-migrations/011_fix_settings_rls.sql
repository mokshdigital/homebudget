-- Fix categories and other settings table RLS policies using EXISTS pattern
-- Run this in Supabase SQL Editor

-- First, create a simple membership check function that returns boolean
CREATE OR REPLACE FUNCTION is_home_member(check_home_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM home_members 
    WHERE home_id = check_home_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_home_owner(check_home_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM home_members 
    WHERE home_id = check_home_id AND user_id = auth.uid() AND role = 'owner'
  );
$$;

GRANT EXECUTE ON FUNCTION is_home_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_home_owner(UUID) TO authenticated;

-- Drop and recreate categories policies
DROP POLICY IF EXISTS "Home members can view categories" ON categories;
DROP POLICY IF EXISTS "Home members can insert categories" ON categories;
DROP POLICY IF EXISTS "Home members can update categories" ON categories;
DROP POLICY IF EXISTS "Only owners can delete categories" ON categories;
DROP POLICY IF EXISTS "Owners can delete categories" ON categories;

CREATE POLICY "Home members can view categories"
ON categories FOR SELECT USING (is_home_member(home_id));

CREATE POLICY "Home members can insert categories"
ON categories FOR INSERT WITH CHECK (is_home_member(home_id));

CREATE POLICY "Home members can update categories"
ON categories FOR UPDATE USING (is_home_member(home_id));

CREATE POLICY "Owners can delete categories"
ON categories FOR DELETE USING (is_home_owner(home_id));

-- Vendors
DROP POLICY IF EXISTS "Home members can view vendors" ON vendors;
DROP POLICY IF EXISTS "Home members can insert vendors" ON vendors;
DROP POLICY IF EXISTS "Home members can update vendors" ON vendors;
DROP POLICY IF EXISTS "Only owners can delete vendors" ON vendors;
DROP POLICY IF EXISTS "Owners can delete vendors" ON vendors;

CREATE POLICY "Home members can view vendors"
ON vendors FOR SELECT USING (is_home_member(home_id));

CREATE POLICY "Home members can insert vendors"
ON vendors FOR INSERT WITH CHECK (is_home_member(home_id));

CREATE POLICY "Home members can update vendors"
ON vendors FOR UPDATE USING (is_home_member(home_id));

CREATE POLICY "Owners can delete vendors"
ON vendors FOR DELETE USING (is_home_owner(home_id));

-- Payment methods
DROP POLICY IF EXISTS "Home members can view payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Home members can insert payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Home members can update payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Only owners can delete payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Owners can delete payment_methods" ON payment_methods;

CREATE POLICY "Home members can view payment_methods"
ON payment_methods FOR SELECT USING (is_home_member(home_id));

CREATE POLICY "Home members can insert payment_methods"
ON payment_methods FOR INSERT WITH CHECK (is_home_member(home_id));

CREATE POLICY "Home members can update payment_methods"
ON payment_methods FOR UPDATE USING (is_home_member(home_id));

CREATE POLICY "Owners can delete payment_methods"
ON payment_methods FOR DELETE USING (is_home_owner(home_id));

-- Classifications
DROP POLICY IF EXISTS "Home members can view classifications" ON classifications;
DROP POLICY IF EXISTS "Home members can insert classifications" ON classifications;
DROP POLICY IF EXISTS "Home members can update classifications" ON classifications;
DROP POLICY IF EXISTS "Only owners can delete classifications" ON classifications;
DROP POLICY IF EXISTS "Owners can delete classifications" ON classifications;

CREATE POLICY "Home members can view classifications"
ON classifications FOR SELECT USING (is_home_member(home_id));

CREATE POLICY "Home members can insert classifications"
ON classifications FOR INSERT WITH CHECK (is_home_member(home_id));

CREATE POLICY "Home members can update classifications"
ON classifications FOR UPDATE USING (is_home_member(home_id));

CREATE POLICY "Owners can delete classifications"
ON classifications FOR DELETE USING (is_home_owner(home_id));

-- Income sources
DROP POLICY IF EXISTS "Home members can view income_sources" ON income_sources;
DROP POLICY IF EXISTS "Home members can insert income_sources" ON income_sources;
DROP POLICY IF EXISTS "Home members can update income_sources" ON income_sources;
DROP POLICY IF EXISTS "Only owners can delete income_sources" ON income_sources;
DROP POLICY IF EXISTS "Owners can delete income_sources" ON income_sources;

CREATE POLICY "Home members can view income_sources"
ON income_sources FOR SELECT USING (is_home_member(home_id));

CREATE POLICY "Home members can insert income_sources"
ON income_sources FOR INSERT WITH CHECK (is_home_member(home_id));

CREATE POLICY "Home members can update income_sources"
ON income_sources FOR UPDATE USING (is_home_member(home_id));

CREATE POLICY "Owners can delete income_sources"
ON income_sources FOR DELETE USING (is_home_owner(home_id));

-- Saving locations
DROP POLICY IF EXISTS "Home members can view saving_locations" ON saving_locations;
DROP POLICY IF EXISTS "Home members can insert saving_locations" ON saving_locations;
DROP POLICY IF EXISTS "Home members can update saving_locations" ON saving_locations;
DROP POLICY IF EXISTS "Only owners can delete saving_locations" ON saving_locations;
DROP POLICY IF EXISTS "Owners can delete saving_locations" ON saving_locations;

CREATE POLICY "Home members can view saving_locations"
ON saving_locations FOR SELECT USING (is_home_member(home_id));

CREATE POLICY "Home members can insert saving_locations"
ON saving_locations FOR INSERT WITH CHECK (is_home_member(home_id));

CREATE POLICY "Home members can update saving_locations"
ON saving_locations FOR UPDATE USING (is_home_member(home_id));

CREATE POLICY "Owners can delete saving_locations"
ON saving_locations FOR DELETE USING (is_home_owner(home_id));
