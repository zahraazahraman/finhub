-- ============================================================
-- FinHub Demo Seed
-- Run once before the presentation against the local database.
-- Creates demo user "Alex Morgan" with realistic sample data.
-- ============================================================

-- ── Demo user ─────────────────────────────────────────────
-- email: demo@finhub.app | access via /demo only (no real password)
INSERT INTO `Users`
  (first_name, last_name, email, password_hash, status, email_verified,
   timezone, preferred_currency_id, ai_tone, ai_data_sharing, weekly_summary_enabled)
VALUES
  ('Alex', 'Morgan', 'demo@finhub.app', 'DEMO_ACCOUNT_NO_LOGIN', 'active', 1,
   'Asia/Beirut', 1, 'professional', 1, 1);

SET @uid = LAST_INSERT_ID();

-- ── Accounts ──────────────────────────────────────────────
-- account_type enum: 'bank' | 'cash' | 'credit_card' | 'wallet'
INSERT INTO `Accounts` (user_id, account_name, account_type, currency_id, balance)
VALUES (@uid, 'Main Checking', 'bank', 1, 4250.00);
SET @acc_checking = LAST_INSERT_ID();

INSERT INTO `Accounts` (user_id, account_name, account_type, currency_id, balance)
VALUES (@uid, 'Savings', 'bank', 1, 12800.00);
SET @acc_savings = LAST_INSERT_ID();

INSERT INTO `Accounts` (user_id, account_name, account_type, currency_id, balance)
VALUES (@uid, 'Credit Card', 'credit_card', 1, -1340.00);
SET @acc_credit = LAST_INSERT_ID();

-- ── User-specific categories ───────────────────────────────
-- Global categories already in DB:
--   1=Salary (income), 2=Freelance (income), 3=Food & Drinks (expense),
--   4=Transport (expense), 5=Entertainment (expense), 7=Clothing (expense)
-- Adding demo-user-specific ones for Utilities, Fitness, Dining:
INSERT INTO `Categories` (name, type, user_id) VALUES ('Utilities',   'expense', @uid);
SET @cat_utilities = LAST_INSERT_ID();

INSERT INTO `Categories` (name, type, user_id) VALUES ('Fitness',     'expense', @uid);
SET @cat_fitness = LAST_INSERT_ID();

INSERT INTO `Categories` (name, type, user_id) VALUES ('Dining Out',  'expense', @uid);
SET @cat_dining = LAST_INSERT_ID();

-- ── Transactions (last 3 months) ──────────────────────────
-- transaction_type enum: 'income' | 'expense' | 'transfer'
-- source_type enum:      'manual' | 'csv'     | 'receipt'
-- Transfers between accounts use type='transfer' and category_id=NULL.

INSERT INTO `Transactions`
  (account_id, category_id, amount, transaction_type, source_type, description, transaction_date)
VALUES
  -- May ── income
  (@acc_checking, 1,              3200.00, 'income',   'manual', 'Monthly salary',               '2026-05-01'),
  (@acc_checking, 2,               850.00, 'income',   'manual', 'Freelance — UI design project','2026-05-08'),
  -- May ── expenses (checking)
  (@acc_checking, 3,               210.00, 'expense',  'manual', 'Supermarket run',              '2026-05-03'),
  (@acc_checking, @cat_utilities,  120.00, 'expense',  'manual', 'Electricity bill',             '2026-05-15'),
  -- May ── expenses (credit card)
  (@acc_credit,   @cat_dining,      74.50, 'expense',  'manual', 'Dinner at Barbar',             '2026-05-10'),
  (@acc_credit,   4,                45.00, 'expense',  'manual', 'Uber rides',                   '2026-05-12'),
  (@acc_credit,   @cat_fitness,     60.00, 'expense',  'manual', 'Gym subscription',             '2026-05-16'),
  (@acc_credit,   5,                35.00, 'expense',  'manual', 'Netflix + Spotify',            '2026-05-20'),
  (@acc_checking, 3,               185.00, 'expense',  'manual', 'Weekly groceries',             '2026-05-24'),
  -- May ── savings transfer
  (@acc_checking, NULL,            500.00, 'transfer', 'manual', 'Transfer to savings',          '2026-05-28'),

  -- April ── income
  (@acc_checking, 1,              3200.00, 'income',   'manual', 'Monthly salary',               '2026-04-01'),
  -- April ── expenses (checking)
  (@acc_checking, 3,               225.00, 'expense',  'manual', 'Supermarket run',              '2026-04-05'),
  (@acc_checking, @cat_utilities,  115.00, 'expense',  'manual', 'Water & internet bill',        '2026-04-18'),
  -- April ── expenses (credit card)
  (@acc_credit,   4,                55.00, 'expense',  'manual', 'Fuel & parking',               '2026-04-09'),
  (@acc_credit,   @cat_dining,      92.00, 'expense',  'manual', 'Lunch with team',              '2026-04-14'),
  (@acc_credit,   @cat_fitness,     60.00, 'expense',  'manual', 'Gym subscription',             '2026-04-16'),
  (@acc_credit,   5,                20.00, 'expense',  'manual', 'Cinema tickets',               '2026-04-22'),
  -- April ── savings transfer
  (@acc_checking, NULL,            400.00, 'transfer', 'manual', 'Transfer to savings',          '2026-04-30'),

  -- March ── income
  (@acc_checking, 1,              3200.00, 'income',   'manual', 'Monthly salary',               '2026-03-01'),
  (@acc_checking, 2,               600.00, 'income',   'manual', 'Freelance — landing page',     '2026-03-18'),
  -- March ── expenses (checking)
  (@acc_checking, 3,               200.00, 'expense',  'manual', 'Supermarket run',              '2026-03-04'),
  (@acc_checking, @cat_utilities,  110.00, 'expense',  'manual', 'Utilities',                    '2026-03-17'),
  -- March ── expenses (credit card)
  (@acc_credit,   4,                48.00, 'expense',  'manual', 'Taxi rides',                   '2026-03-07'),
  (@acc_credit,   @cat_dining,      65.00, 'expense',  'manual', 'Restaurant with family',       '2026-03-13'),
  (@acc_credit,   @cat_fitness,     60.00, 'expense',  'manual', 'Gym subscription',             '2026-03-16'),
  -- March ── savings transfer
  (@acc_checking, NULL,            500.00, 'transfer', 'manual', 'Transfer to savings',          '2026-03-31');

-- ── Goals ─────────────────────────────────────────────────
-- goal_type enum: 'saving' | 'debt_repayment'
INSERT INTO `Goals`
  (user_id, goal_name, goal_type, target_amount, current_amount, deadline, currency_id)
VALUES
  (@uid, 'Emergency Fund',  'saving', 10000.00,  6800.00, '2026-12-31', 1),
  (@uid, 'Summer Vacation', 'saving',  3500.00,  1200.00, '2026-08-01', 1),
  (@uid, 'New Laptop',      'saving',  1800.00,   950.00, '2026-07-15', 1);

-- ── Investments ───────────────────────────────────────────
-- investment_type enum: 'stock' | 'crypto' | 'real_estate' | 'other'
INSERT INTO `Investments`
  (user_id, investment_name, symbol, investment_type, quantity,
   purchase_price, current_price, currency_id, purchase_date, notes)
VALUES
  (@uid, 'Apple Inc.',  'AAPL', 'stock',  10.0000, 175.50, 211.30, 1, '2025-09-15', 'Long-term hold'),
  (@uid, 'Bitcoin',     'BTC',  'crypto',  0.1200, 62000.00, 67500.00, 1, '2025-11-01', 'Dollar-cost averaging'),
  (@uid, 'S&P 500 ETF', 'VOO',  'other',   5.0000,  420.00,   468.75, 1, '2025-10-10', 'Index fund core position');
