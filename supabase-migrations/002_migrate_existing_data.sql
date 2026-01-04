-- =====================================================
-- HOMEBUDGET AI - MIGRATE EXISTING DATA
-- Run this AFTER 001_household_system.sql
-- 
-- This will:
-- 1. Create a home for each existing user
-- 2. Link them as owner
-- 3. Update all their data with the home_id
-- =====================================================

-- Create homes for all existing users who don't have one
INSERT INTO homes (name, created_by)
SELECT 
  'My Home',
  u.id
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM home_members hm WHERE hm.user_id = u.id
);

-- Add users as owners of their homes
INSERT INTO home_members (home_id, user_id, role, display_name)
SELECT 
  h.id,
  h.created_by,
  'owner',
  COALESCE(u.raw_user_meta_data->>'full_name', u.email)
FROM homes h
JOIN auth.users u ON u.id = h.created_by
WHERE NOT EXISTS (
  SELECT 1 FROM home_members hm WHERE hm.home_id = h.id AND hm.user_id = h.created_by
);

-- Update all transactions with home_id
UPDATE transactions t
SET 
  home_id = h.id,
  added_by = COALESCE(t.added_by, t.user_id)
FROM homes h
WHERE t.user_id = h.created_by
AND t.home_id IS NULL;

-- Update all incomes with home_id
UPDATE incomes i
SET 
  home_id = h.id,
  added_by = COALESCE(i.added_by, i.user_id)
FROM homes h
WHERE i.user_id = h.created_by
AND i.home_id IS NULL;

-- Update all savings with home_id
UPDATE savings s
SET 
  home_id = h.id,
  added_by = COALESCE(s.added_by, s.user_id)
FROM homes h
WHERE s.user_id = h.created_by
AND s.home_id IS NULL;

-- Update all budgets with home_id
UPDATE budgets b
SET 
  home_id = h.id,
  added_by = COALESCE(b.added_by, b.user_id)
FROM homes h
WHERE b.user_id = h.created_by
AND b.home_id IS NULL;

-- Update all categories with home_id
UPDATE categories c
SET home_id = h.id
FROM homes h
WHERE c.user_id = h.created_by
AND c.home_id IS NULL;

-- Update all vendors with home_id
UPDATE vendors v
SET home_id = h.id
FROM homes h
WHERE v.user_id = h.created_by
AND v.home_id IS NULL;

-- Update all payment_methods with home_id
UPDATE payment_methods pm
SET home_id = h.id
FROM homes h
WHERE pm.user_id = h.created_by
AND pm.home_id IS NULL;

-- Update all classifications with home_id
UPDATE classifications c
SET home_id = h.id
FROM homes h
WHERE c.user_id = h.created_by
AND c.home_id IS NULL;

-- Update all income_sources with home_id
UPDATE income_sources i
SET home_id = h.id
FROM homes h
WHERE i.user_id = h.created_by
AND i.home_id IS NULL;

-- Update all saving_locations with home_id
UPDATE saving_locations sl
SET home_id = h.id
FROM homes h
WHERE sl.user_id = h.created_by
AND sl.home_id IS NULL;

-- =====================================================
-- VERIFICATION: Check if migration was successful
-- =====================================================
-- Run these queries to verify:

-- SELECT COUNT(*) as homes_created FROM homes;
-- SELECT COUNT(*) as members_created FROM home_members;
-- SELECT COUNT(*) as transactions_without_home FROM transactions WHERE home_id IS NULL;
-- SELECT COUNT(*) as categories_without_home FROM categories WHERE home_id IS NULL;

-- =====================================================
-- DONE! Your existing data is now linked to homes.
-- =====================================================
