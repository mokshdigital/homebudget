-- =================================================================
-- GENERATE DUMMY DATA FOR PORTFOLIO SCREENSHOTS
-- Run this in Supabase SQL Editor
-- =================================================================

DO $$
DECLARE
  v_user_id UUID;
  v_home_id UUID;
  
  -- ID Variables to link data
  v_cat_housing UUID;
  v_cat_food UUID;
  v_cat_transport UUID;
  v_cat_entertainment UUID;
  v_cat_shopping UUID;
  v_cat_utilities UUID;
  
  v_pm_credit UUID;
  v_pm_debit UUID;
  v_pm_cash UUID;
  
  v_ven_amazon UUID;
  v_ven_starbucks UUID;
  v_ven_uber UUID;
  v_ven_walmart UUID;
  v_ven_netflix UUID;
  v_ven_shell UUID;
  v_ven_landlord UUID;
  
  v_src_salary UUID;
  v_src_freelance UUID;
  
  v_loc_savings UUID;
  
BEGIN
  -- 1. Get User by Email
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'aakashsanghvi2791@gmail.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User aakashsanghvi2791@gmail.com not found in auth.users table!';
  END IF;

  SELECT home_id INTO v_home_id FROM home_members WHERE user_id = v_user_id LIMIT 1;
  
  IF v_home_id IS NULL THEN
    RAISE EXCEPTION 'User has no home! Create a home in the app first.';
  END IF;

  -- 2. Create Categories
  INSERT INTO categories (name, icon, color, home_id, user_id) VALUES
  ('Housing', 'Home', '#2563eb', v_home_id, v_user_id) RETURNING id INTO v_cat_housing;
  INSERT INTO categories (name, icon, color, home_id, user_id) VALUES
  ('Food & Dining', 'Utensils', '#16a34a', v_home_id, v_user_id) RETURNING id INTO v_cat_food;
  INSERT INTO categories (name, icon, color, home_id, user_id) VALUES
  ('Transportation', 'Car', '#ea580c', v_home_id, v_user_id) RETURNING id INTO v_cat_transport;
  INSERT INTO categories (name, icon, color, home_id, user_id) VALUES
  ('Entertainment', 'Film', '#9333ea', v_home_id, v_user_id) RETURNING id INTO v_cat_entertainment;
  INSERT INTO categories (name, icon, color, home_id, user_id) VALUES
  ('Shopping', 'ShoppingBag', '#db2777', v_home_id, v_user_id) RETURNING id INTO v_cat_shopping;
  INSERT INTO categories (name, icon, color, home_id, user_id) VALUES
  ('Utilities', 'Zap', '#eab308', v_home_id, v_user_id) RETURNING id INTO v_cat_utilities;

  -- 3. Create Payment Methods
  INSERT INTO payment_methods (name, icon, home_id, user_id) VALUES
  ('Chase Sapphire', 'CreditCard', v_home_id, v_user_id) RETURNING id INTO v_pm_credit;
  INSERT INTO payment_methods (name, icon, home_id, user_id) VALUES
  ('Checking Account', 'Landmark', v_home_id, v_user_id) RETURNING id INTO v_pm_debit;
  INSERT INTO payment_methods (name, icon, home_id, user_id) VALUES
  ('Cash', 'Banknote', v_home_id, v_user_id) RETURNING id INTO v_pm_cash;

  -- 4. Create Vendors
  INSERT INTO vendors (name, home_id, user_id) VALUES ('Amazon', v_home_id, v_user_id) RETURNING id INTO v_ven_amazon;
  INSERT INTO vendors (name, home_id, user_id) VALUES ('Starbucks', v_home_id, v_user_id) RETURNING id INTO v_ven_starbucks;
  INSERT INTO vendors (name, home_id, user_id) VALUES ('Uber', v_home_id, v_user_id) RETURNING id INTO v_ven_uber;
  INSERT INTO vendors (name, home_id, user_id) VALUES ('Walmart', v_home_id, v_user_id) RETURNING id INTO v_ven_walmart;
  INSERT INTO vendors (name, home_id, user_id) VALUES ('Netflix', v_home_id, v_user_id) RETURNING id INTO v_ven_netflix;
  INSERT INTO vendors (name, home_id, user_id) VALUES ('Shell Station', v_home_id, v_user_id) RETURNING id INTO v_ven_shell;
  INSERT INTO vendors (name, home_id, user_id) VALUES ('Property Management', v_home_id, v_user_id) RETURNING id INTO v_ven_landlord;

  -- 5. Create Income Sources
  INSERT INTO income_sources (name, icon, home_id, user_id) VALUES 
  ('Tech Corp Salary', 'Briefcase', v_home_id, v_user_id) RETURNING id INTO v_src_salary;
  INSERT INTO income_sources (name, icon, home_id, user_id) VALUES 
  ('Freelance Work', 'Laptop', v_home_id, v_user_id) RETURNING id INTO v_src_freelance;

  -- 6. Create Saving Locations
  INSERT INTO saving_locations (name, home_id, user_id) VALUES ('High Yield Savings', v_home_id, v_user_id) RETURNING id INTO v_loc_savings;

  -- 7. Insert Incomes (Past 3 months)
  -- Current Month
  INSERT INTO incomes (date, amount, description, source_id, home_id, added_by, user_id) VALUES
  (CURRENT_DATE - INTERVAL '2 days', 4200.00, 'Monthly Salary', v_src_salary, v_home_id, v_user_id, v_user_id);
  INSERT INTO incomes (date, amount, description, source_id, home_id, added_by, user_id) VALUES
  (CURRENT_DATE - INTERVAL '15 days', 850.00, 'Web Design Project', v_src_freelance, v_home_id, v_user_id, v_user_id);
  -- Last Month
  INSERT INTO incomes (date, amount, description, source_id, home_id, added_by, user_id) VALUES
  (CURRENT_DATE - INTERVAL '1 month 2 days', 4200.00, 'Monthly Salary', v_src_salary, v_home_id, v_user_id, v_user_id);
  
  -- 8. Insert Budgets
  INSERT INTO budgets (category_id, amount, duration, home_id, added_by, user_id) VALUES
  (v_cat_food, 600, 'monthly', v_home_id, v_user_id, v_user_id),
  (v_cat_transport, 300, 'monthly', v_home_id, v_user_id, v_user_id),
  (v_cat_entertainment, 200, 'monthly', v_home_id, v_user_id, v_user_id),
  (v_cat_shopping, 400, 'monthly', v_home_id, v_user_id, v_user_id);

  -- 9. Insert Transactions (Expenses) - Realistic Mix
  
  -- Rent (Housing)
  INSERT INTO transactions (date, amount, description, category_id, payment_method_id, vendor_id, home_id, added_by, user_id) VALUES
  (CURRENT_DATE - INTERVAL '3 days', 1850.00, 'Monthly Rent', v_cat_housing, v_pm_debit, v_ven_landlord, v_home_id, v_user_id, v_user_id);
  
  -- Groceries (Walmart)
  INSERT INTO transactions (date, amount, description, category_id, payment_method_id, vendor_id, home_id, added_by, user_id) VALUES
  (CURRENT_DATE - INTERVAL '5 days', 145.23, 'Weekly Groceries', v_cat_food, v_pm_credit, v_ven_walmart, v_home_id, v_user_id, v_user_id),
  (CURRENT_DATE - INTERVAL '12 days', 89.50, 'Groceries & Supplies', v_cat_food, v_pm_credit, v_ven_walmart, v_home_id, v_user_id, v_user_id),
  (CURRENT_DATE - INTERVAL '19 days', 210.15, 'Big Grocery Haul', v_cat_food, v_pm_credit, v_ven_walmart, v_home_id, v_user_id, v_user_id);

  -- Coffee (Starbucks)
  INSERT INTO transactions (date, amount, description, category_id, payment_method_id, vendor_id, home_id, added_by, user_id) VALUES
  (CURRENT_DATE - INTERVAL '1 day', 6.75, 'Morning Coffee', v_cat_food, v_pm_credit, v_ven_starbucks, v_home_id, v_user_id, v_user_id),
  (CURRENT_DATE - INTERVAL '4 days', 12.50, 'Coffee with friend', v_cat_food, v_pm_credit, v_ven_starbucks, v_home_id, v_user_id, v_user_id),
  (CURRENT_DATE - INTERVAL '8 days', 5.95, 'Latte', v_cat_food, v_pm_credit, v_ven_starbucks, v_home_id, v_user_id, v_user_id);

  -- Transport (Uber/Shell)
  INSERT INTO transactions (date, amount, description, category_id, payment_method_id, vendor_id, home_id, added_by, user_id) VALUES
  (CURRENT_DATE - INTERVAL '2 days', 24.50, 'Ride to downtown', v_cat_transport, v_pm_credit, v_ven_uber, v_home_id, v_user_id, v_user_id),
  (CURRENT_DATE - INTERVAL '10 days', 45.00, 'Gas Refill', v_cat_transport, v_pm_credit, v_ven_shell, v_home_id, v_user_id, v_user_id);

  -- Shopping (Amazon)
  INSERT INTO transactions (date, amount, description, category_id, payment_method_id, vendor_id, home_id, added_by, user_id) VALUES
  (CURRENT_DATE - INTERVAL '6 days', 34.99, 'Phone Case & Cables', v_cat_shopping, v_pm_credit, v_ven_amazon, v_home_id, v_user_id, v_user_id),
  (CURRENT_DATE - INTERVAL '15 days', 129.00, 'New Headphones', v_cat_shopping, v_pm_credit, v_ven_amazon, v_home_id, v_user_id, v_user_id);

  -- Subscriptions (Netflix)
  INSERT INTO transactions (date, amount, description, category_id, payment_method_id, vendor_id, home_id, added_by, user_id) VALUES
  (CURRENT_DATE - INTERVAL '10 days', 15.99, 'Netflix Subscription', v_cat_entertainment, v_pm_credit, v_ven_netflix, v_home_id, v_user_id, v_user_id);

  -- Utilities
  INSERT INTO transactions (date, amount, description, category_id, payment_method_id, vendor_id, home_id, added_by, user_id) VALUES
  (CURRENT_DATE - INTERVAL '20 days', 145.00, 'Electric Bill', v_cat_utilities, v_pm_debit, NULL, v_home_id, v_user_id, v_user_id);

  -- 10. Savings Contributions
  INSERT INTO savings (date, amount, description, location_id, home_id, added_by, user_id) VALUES
  (CURRENT_DATE - INTERVAL '1 day', 500.00, 'Monthly Savings Transfer', v_loc_savings, v_home_id, v_user_id, v_user_id),
  (CURRENT_DATE - INTERVAL '15 days', 200.00, 'Extra Freelance Savings', v_loc_savings, v_home_id, v_user_id, v_user_id);

END $$;
