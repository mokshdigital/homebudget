-- =================================================================
-- CONSOLIDATED RLS FIX FOR HOMEBUDGET AI
-- This script fixes "400 Bad Request" errors when adding data
-- by optimizing Row Level Security (RLS) policies.
-- =================================================================

-- 1. Create secure helper functions (bypassing RLS for performance and to stop recursion)

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

-- 2. Fix home_members RLS to prevent infinite recursion
-- We use a separate function for list gathering to be safe

CREATE OR REPLACE FUNCTION get_my_home_ids()
RETURNS TABLE (home_id UUID) 
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT home_id FROM home_members WHERE user_id = auth.uid();
$$;

DROP POLICY IF EXISTS "Users can view home members" ON home_members;
CREATE POLICY "Users can view home members"
ON home_members FOR SELECT
USING (
  home_id IN (SELECT home_id FROM get_my_home_ids())
);

-- 3. Apply optimized policies to ALL data tables

-- List of tables to update
-- [transactions, incomes, savings, budgets, categories, vendors, 
--  payment_methods, classifications, income_sources, saving_locations]

-- MACRO for creating standard member policies
-- (We have to write them out since SQL doesn't have macros, but using a consistent pattern)

-- === TRANSACTIONS ===
DROP POLICY IF EXISTS "Home members can view transactions" ON transactions;
DROP POLICY IF EXISTS "Home members can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Home members can update transactions" ON transactions;
DROP POLICY IF EXISTS "Home members can delete transactions" ON transactions;
-- Legacy policies cleanup
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

CREATE POLICY "Home members can view transactions"
ON transactions FOR SELECT USING (is_home_member(home_id));

CREATE POLICY "Home members can insert transactions"
ON transactions FOR INSERT WITH CHECK (is_home_member(home_id));

CREATE POLICY "Home members can update transactions"
ON transactions FOR UPDATE USING (is_home_member(home_id));

CREATE POLICY "Home members can delete transactions"
ON transactions FOR DELETE USING (is_home_member(home_id));

-- === INCOMES ===
DROP POLICY IF EXISTS "Home members can view incomes" ON incomes;
DROP POLICY IF EXISTS "Home members can insert incomes" ON incomes;
DROP POLICY IF EXISTS "Home members can update incomes" ON incomes;
DROP POLICY IF EXISTS "Home members can delete incomes" ON incomes;

CREATE POLICY "Home members can view incomes"
ON incomes FOR SELECT USING (is_home_member(home_id));

CREATE POLICY "Home members can insert incomes"
ON incomes FOR INSERT WITH CHECK (is_home_member(home_id));

CREATE POLICY "Home members can update incomes"
ON incomes FOR UPDATE USING (is_home_member(home_id));

CREATE POLICY "Home members can delete incomes"
ON incomes FOR DELETE USING (is_home_member(home_id));

-- === SAVINGS ===
DROP POLICY IF EXISTS "Home members can view savings" ON savings;
DROP POLICY IF EXISTS "Home members can insert savings" ON savings;
DROP POLICY IF EXISTS "Home members can update savings" ON savings;
DROP POLICY IF EXISTS "Home members can delete savings" ON savings;

CREATE POLICY "Home members can view savings"
ON savings FOR SELECT USING (is_home_member(home_id));

CREATE POLICY "Home members can insert savings"
ON savings FOR INSERT WITH CHECK (is_home_member(home_id));

CREATE POLICY "Home members can update savings"
ON savings FOR UPDATE USING (is_home_member(home_id));

CREATE POLICY "Home members can delete savings"
ON savings FOR DELETE USING (is_home_member(home_id));

-- === BUDGETS ===
DROP POLICY IF EXISTS "Home members can view budgets" ON budgets;
DROP POLICY IF EXISTS "Home members can insert budgets" ON budgets;
DROP POLICY IF EXISTS "Home members can update budgets" ON budgets;
DROP POLICY IF EXISTS "Home members can delete budgets" ON budgets;

CREATE POLICY "Home members can view budgets"
ON budgets FOR SELECT USING (is_home_member(home_id));

CREATE POLICY "Home members can insert budgets"
ON budgets FOR INSERT WITH CHECK (is_home_member(home_id));

CREATE POLICY "Home members can update budgets"
ON budgets FOR UPDATE USING (is_home_member(home_id));

CREATE POLICY "Home members can delete budgets"
ON budgets FOR DELETE USING (is_home_member(home_id));

-- === CATEGORIES ===
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

-- === VENDORS ===
DROP POLICY IF EXISTS "Home members can view vendors" ON vendors;
DROP POLICY IF EXISTS "Home members can insert vendors" ON vendors;
DROP POLICY IF EXISTS "Home members can update vendors" ON vendors;
DROP POLICY IF EXISTS "Only owners can delete vendors" ON vendors;
DROP POLICY IF EXISTS "Owners can delete vendors" ON vendors; -- Added redundant drop for safety

CREATE POLICY "Home members can view vendors"
ON vendors FOR SELECT USING (is_home_member(home_id));

CREATE POLICY "Home members can insert vendors"
ON vendors FOR INSERT WITH CHECK (is_home_member(home_id));

CREATE POLICY "Home members can update vendors"
ON vendors FOR UPDATE USING (is_home_member(home_id));

CREATE POLICY "Owners can delete vendors"
ON vendors FOR DELETE USING (is_home_owner(home_id));

-- === PAYMENT METHODS ===
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

-- === CLASSIFICATIONS ===
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

-- === INCOME SOURCES ===
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

-- === SAVING LOCATIONS ===
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

-- Final verification
SELECT 'RLS policies updated successfully' as status;
