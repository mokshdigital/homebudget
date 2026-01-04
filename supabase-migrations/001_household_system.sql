-- =====================================================
-- HOMEBUDGET AI - HOUSEHOLD SYSTEM MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: CREATE HOMES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS homes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Home',
  invite_code TEXT UNIQUE,
  invite_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on homes
ALTER TABLE homes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: CREATE HOME_MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS home_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID REFERENCES homes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  display_name TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(home_id, user_id)
);

-- Enable RLS on home_members
ALTER TABLE home_members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: ADD home_id AND added_by TO ALL DATA TABLES
-- =====================================================

-- Transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS home_id UUID REFERENCES homes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES auth.users(id);

-- Incomes
ALTER TABLE incomes 
ADD COLUMN IF NOT EXISTS home_id UUID REFERENCES homes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES auth.users(id);

-- Savings
ALTER TABLE savings 
ADD COLUMN IF NOT EXISTS home_id UUID REFERENCES homes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES auth.users(id);

-- Budgets
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS home_id UUID REFERENCES homes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES auth.users(id);

-- Categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS home_id UUID REFERENCES homes(id) ON DELETE CASCADE;

-- Vendors
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS home_id UUID REFERENCES homes(id) ON DELETE CASCADE;

-- Payment Methods
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS home_id UUID REFERENCES homes(id) ON DELETE CASCADE;

-- Classifications
ALTER TABLE classifications 
ADD COLUMN IF NOT EXISTS home_id UUID REFERENCES homes(id) ON DELETE CASCADE;

-- Income Sources
ALTER TABLE income_sources 
ADD COLUMN IF NOT EXISTS home_id UUID REFERENCES homes(id) ON DELETE CASCADE;

-- Saving Locations
ALTER TABLE saving_locations 
ADD COLUMN IF NOT EXISTS home_id UUID REFERENCES homes(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_transactions_home_id ON transactions(home_id);
CREATE INDEX IF NOT EXISTS idx_incomes_home_id ON incomes(home_id);
CREATE INDEX IF NOT EXISTS idx_savings_home_id ON savings(home_id);
CREATE INDEX IF NOT EXISTS idx_budgets_home_id ON budgets(home_id);
CREATE INDEX IF NOT EXISTS idx_categories_home_id ON categories(home_id);
CREATE INDEX IF NOT EXISTS idx_vendors_home_id ON vendors(home_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_home_id ON payment_methods(home_id);
CREATE INDEX IF NOT EXISTS idx_classifications_home_id ON classifications(home_id);
CREATE INDEX IF NOT EXISTS idx_income_sources_home_id ON income_sources(home_id);
CREATE INDEX IF NOT EXISTS idx_saving_locations_home_id ON saving_locations(home_id);
CREATE INDEX IF NOT EXISTS idx_home_members_user_id ON home_members(user_id);
CREATE INDEX IF NOT EXISTS idx_home_members_home_id ON home_members(home_id);
CREATE INDEX IF NOT EXISTS idx_homes_invite_code ON homes(invite_code);

-- =====================================================
-- STEP 5: RLS POLICIES FOR HOMES TABLE
-- =====================================================

-- Users can view homes they are members of
CREATE POLICY "Users can view their homes"
ON homes FOR SELECT
USING (
  id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid())
);

-- Users can create new homes
CREATE POLICY "Users can create homes"
ON homes FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Only owners can update home settings
CREATE POLICY "Owners can update homes"
ON homes FOR UPDATE
USING (
  id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner')
);

-- Only owners can delete homes
CREATE POLICY "Owners can delete homes"
ON homes FOR DELETE
USING (
  id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner')
);

-- =====================================================
-- STEP 6: RLS POLICIES FOR HOME_MEMBERS TABLE
-- =====================================================

-- Users can view members of homes they belong to
CREATE POLICY "Users can view home members"
ON home_members FOR SELECT
USING (
  home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid())
);

-- Owners can add members
CREATE POLICY "Owners can add members"
ON home_members FOR INSERT
WITH CHECK (
  home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner')
  OR user_id = auth.uid() -- Allow users to add themselves when joining via invite
);

-- Owners can remove members
CREATE POLICY "Owners can remove members"
ON home_members FOR DELETE
USING (
  home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner')
);

-- =====================================================
-- STEP 7: UPDATE RLS POLICIES FOR DATA TABLES
-- =====================================================

-- Drop existing policies first (they may fail if they don't exist, that's OK)
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view their own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can insert their own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can update their own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can delete their own incomes" ON incomes;

DROP POLICY IF EXISTS "Users can view their own savings" ON savings;
DROP POLICY IF EXISTS "Users can insert their own savings" ON savings;
DROP POLICY IF EXISTS "Users can update their own savings" ON savings;
DROP POLICY IF EXISTS "Users can delete their own savings" ON savings;

DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;

DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

DROP POLICY IF EXISTS "Users can view their own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can insert their own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can update their own vendors" ON vendors;
DROP POLICY IF EXISTS "Users can delete their own vendors" ON vendors;

DROP POLICY IF EXISTS "Users can view their own payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can insert their own payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can update their own payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can delete their own payment_methods" ON payment_methods;

DROP POLICY IF EXISTS "Users can view their own classifications" ON classifications;
DROP POLICY IF EXISTS "Users can insert their own classifications" ON classifications;
DROP POLICY IF EXISTS "Users can update their own classifications" ON classifications;
DROP POLICY IF EXISTS "Users can delete their own classifications" ON classifications;

DROP POLICY IF EXISTS "Users can view their own income_sources" ON income_sources;
DROP POLICY IF EXISTS "Users can insert their own income_sources" ON income_sources;
DROP POLICY IF EXISTS "Users can update their own income_sources" ON income_sources;
DROP POLICY IF EXISTS "Users can delete their own income_sources" ON income_sources;

DROP POLICY IF EXISTS "Users can view their own saving_locations" ON saving_locations;
DROP POLICY IF EXISTS "Users can insert their own saving_locations" ON saving_locations;
DROP POLICY IF EXISTS "Users can update their own saving_locations" ON saving_locations;
DROP POLICY IF EXISTS "Users can delete their own saving_locations" ON saving_locations;

-- =====================================================
-- TRANSACTIONS - New home-based policies
-- =====================================================
CREATE POLICY "Home members can view transactions"
ON transactions FOR SELECT
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can insert transactions"
ON transactions FOR INSERT
WITH CHECK (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can update transactions"
ON transactions FOR UPDATE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can delete transactions"
ON transactions FOR DELETE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

-- =====================================================
-- INCOMES - New home-based policies
-- =====================================================
CREATE POLICY "Home members can view incomes"
ON incomes FOR SELECT
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can insert incomes"
ON incomes FOR INSERT
WITH CHECK (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can update incomes"
ON incomes FOR UPDATE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can delete incomes"
ON incomes FOR DELETE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

-- =====================================================
-- SAVINGS - New home-based policies
-- =====================================================
CREATE POLICY "Home members can view savings"
ON savings FOR SELECT
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can insert savings"
ON savings FOR INSERT
WITH CHECK (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can update savings"
ON savings FOR UPDATE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can delete savings"
ON savings FOR DELETE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

-- =====================================================
-- BUDGETS - New home-based policies
-- =====================================================
CREATE POLICY "Home members can view budgets"
ON budgets FOR SELECT
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can insert budgets"
ON budgets FOR INSERT
WITH CHECK (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can update budgets"
ON budgets FOR UPDATE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can delete budgets"
ON budgets FOR DELETE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

-- =====================================================
-- CATEGORIES - New home-based policies (Owner delete only)
-- =====================================================
CREATE POLICY "Home members can view categories"
ON categories FOR SELECT
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can insert categories"
ON categories FOR INSERT
WITH CHECK (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can update categories"
ON categories FOR UPDATE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Only owners can delete categories"
ON categories FOR DELETE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner'));

-- =====================================================
-- VENDORS - New home-based policies (Owner delete only)
-- =====================================================
CREATE POLICY "Home members can view vendors"
ON vendors FOR SELECT
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can insert vendors"
ON vendors FOR INSERT
WITH CHECK (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can update vendors"
ON vendors FOR UPDATE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Only owners can delete vendors"
ON vendors FOR DELETE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner'));

-- =====================================================
-- PAYMENT_METHODS - New home-based policies (Owner delete only)
-- =====================================================
CREATE POLICY "Home members can view payment_methods"
ON payment_methods FOR SELECT
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can insert payment_methods"
ON payment_methods FOR INSERT
WITH CHECK (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can update payment_methods"
ON payment_methods FOR UPDATE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Only owners can delete payment_methods"
ON payment_methods FOR DELETE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner'));

-- =====================================================
-- CLASSIFICATIONS - New home-based policies (Owner delete only)
-- =====================================================
CREATE POLICY "Home members can view classifications"
ON classifications FOR SELECT
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can insert classifications"
ON classifications FOR INSERT
WITH CHECK (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can update classifications"
ON classifications FOR UPDATE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Only owners can delete classifications"
ON classifications FOR DELETE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner'));

-- =====================================================
-- INCOME_SOURCES - New home-based policies (Owner delete only)
-- =====================================================
CREATE POLICY "Home members can view income_sources"
ON income_sources FOR SELECT
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can insert income_sources"
ON income_sources FOR INSERT
WITH CHECK (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can update income_sources"
ON income_sources FOR UPDATE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Only owners can delete income_sources"
ON income_sources FOR DELETE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner'));

-- =====================================================
-- SAVING_LOCATIONS - New home-based policies (Owner delete only)
-- =====================================================
CREATE POLICY "Home members can view saving_locations"
ON saving_locations FOR SELECT
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can insert saving_locations"
ON saving_locations FOR INSERT
WITH CHECK (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Home members can update saving_locations"
ON saving_locations FOR UPDATE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid()));

CREATE POLICY "Only owners can delete saving_locations"
ON saving_locations FOR DELETE
USING (home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner'));

-- =====================================================
-- STEP 8: HELPER FUNCTION TO GENERATE INVITE CODES
-- =====================================================
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(6), 'hex');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DONE! 
-- Next: Run the migration script for existing data
-- =====================================================
