-- ============================================================
-- FinHub Demo Seed  (Apr 15 – Jun 15 2026)
-- Wipes any existing demo@finhub.app data then re-seeds cleanly.
-- Run via phpMyAdmin Import or XAMPP MySQL CLI against the finhub DB.
-- ============================================================

START TRANSACTION;

-- ── 1. Capture existing demo user ID (NULL if first run) ──────
SET @uid = (SELECT user_id FROM Users WHERE email = 'demo@finhub.app' LIMIT 1);

-- ── 2. Cleanup — child tables first (respects all FK constraints) ─

-- ChatMessages → ChatSessions
DELETE FROM ChatMessages
  WHERE chat_session_id IN (
    SELECT chat_session_id FROM ChatSessions WHERE user_id = @uid
  );

-- GoalContributions → Goals, Accounts
DELETE FROM GoalContributions
  WHERE goal_id IN (SELECT goal_id FROM Goals WHERE user_id = @uid);

-- Reminders → Bills  (must precede Bills delete)
DELETE FROM Reminders WHERE user_id = @uid;

-- Bills → Transactions (paid_transaction_id FK)
DELETE FROM Bills WHERE user_id = @uid;

DELETE FROM EmailLogs   WHERE user_id = @uid;
DELETE FROM Insights    WHERE user_id = @uid;
DELETE FROM Notifications WHERE user_id = @uid;
DELETE FROM ChatSessions  WHERE user_id = @uid;

-- Transactions → Accounts
DELETE FROM Transactions
  WHERE account_id IN (SELECT account_id FROM Accounts WHERE user_id = @uid);

DELETE FROM Goals       WHERE user_id = @uid;
DELETE FROM Investments WHERE user_id = @uid;
DELETE FROM Accounts    WHERE user_id = @uid;
DELETE FROM Categories  WHERE user_id = @uid;
DELETE FROM UserSessions WHERE user_id = @uid;
DELETE FROM Users       WHERE email = 'demo@finhub.app';

-- ── 3. Demo user ───────────────────────────────────────────────
INSERT INTO `Users`
  (first_name, last_name, email, password_hash, status, email_verified,
   timezone, preferred_currency_id, ai_tone, ai_data_sharing, weekly_summary_enabled)
VALUES
  ('Alex', 'Morgan', 'demo@finhub.app', 'DEMO_ACCOUNT_NO_LOGIN', 'active', 1,
   'Asia/Beirut', 1, 'professional', 1, 1);

SET @uid = LAST_INSERT_ID();

-- ── 4. Accounts ────────────────────────────────────────────────
-- account_type enum: 'bank' | 'cash' | 'credit_card' | 'wallet'
-- Balances are the exact result of all transactions below.
-- Main Account:  income $9,700  –  expenses $1,925  =  $7,775
-- Credit Card:   expenses $400                       =  –$400

INSERT INTO `Accounts` (user_id, account_name, account_type, currency_id, balance)
VALUES (@uid, 'Main Account', 'bank', 1, 7775.00);
SET @acc_bank = LAST_INSERT_ID();

INSERT INTO `Accounts` (user_id, account_name, account_type, currency_id, balance)
VALUES (@uid, 'Credit Card', 'credit_card', 1, -400.00);
SET @acc_cc = LAST_INSERT_ID();

-- ── 5. User-specific categories ────────────────────────────────
-- Global categories already in DB (user_id = NULL):
--   1=Salary  2=Freelance  3=Food & Drinks  4=Transport
--   5=Entertainment  7=Clothing  19=Goal Contribution

INSERT INTO `Categories` (name, type, user_id) VALUES ('Utilities',  'expense', @uid);
SET @cat_utilities = LAST_INSERT_ID();

INSERT INTO `Categories` (name, type, user_id) VALUES ('Dining Out', 'expense', @uid);
SET @cat_dining = LAST_INSERT_ID();

INSERT INTO `Categories` (name, type, user_id) VALUES ('Fitness',    'expense', @uid);
SET @cat_fitness = LAST_INSERT_ID();

-- ── 6. Goals ───────────────────────────────────────────────────
-- goal_type enum: 'saving' | 'debt_repayment'
-- current_amount is set to the exact SUM of contributions below.
-- Emergency Fund  contributions: $200 (Apr 30) + $300 (May 28)  = $500
-- Summer Vacation contributions: $200 (May 30) + $150 (Jun 12)  = $350

INSERT INTO `Goals`
  (user_id, goal_name, goal_type, target_amount, current_amount, deadline, currency_id)
VALUES (@uid, 'Emergency Fund',  'saving', 5000.00, 500.00, NULL,         1);
SET @goal_emergency = LAST_INSERT_ID();

INSERT INTO `Goals`
  (user_id, goal_name, goal_type, target_amount, current_amount, deadline, currency_id)
VALUES (@uid, 'Summer Vacation', 'saving', 2000.00, 350.00, '2026-08-31', 1);
SET @goal_vacation = LAST_INSERT_ID();

-- ── 7. Regular transactions ────────────────────────────────────
-- transaction_type enum: 'income' | 'expense' | 'transfer'
-- source_type      enum: 'manual' | 'csv'    | 'receipt'
-- Transactions referencing @cat_utilities, @cat_dining, @cat_fitness are
-- inserted AFTER those categories are created (step 5) — FK is satisfied.

-- Main Account — April
INSERT INTO `Transactions`
  (account_id, category_id, amount, transaction_type, source_type, description, transaction_date)
VALUES
  (@acc_bank, 1,              2800.00, 'income',  'manual', 'Monthly salary',    '2026-04-15'),
  (@acc_bank, 3,               150.00, 'expense', 'manual', 'Supermarket',        '2026-04-17'),
  (@acc_bank, 4,                45.00, 'expense', 'manual', 'Transport',          '2026-04-19'),
  (@acc_bank, @cat_utilities,   85.00, 'expense', 'manual', 'Utilities',          '2026-04-21'),
  (@acc_bank, @cat_fitness,     50.00, 'expense', 'manual', 'Gym membership',     '2026-04-22'),
  (@acc_bank, 2,               500.00, 'income',  'manual', 'Freelance project',  '2026-04-28');

-- Main Account — May
INSERT INTO `Transactions`
  (account_id, category_id, amount, transaction_type, source_type, description, transaction_date)
VALUES
  (@acc_bank, 1,              2800.00, 'income',  'manual', 'Monthly salary',    '2026-05-01'),
  (@acc_bank, 3,               140.00, 'expense', 'manual', 'Supermarket',        '2026-05-03'),
  (@acc_bank, 4,                55.00, 'expense', 'manual', 'Transport',          '2026-05-07'),
  (@acc_bank, @cat_utilities,   90.00, 'expense', 'manual', 'Utilities',          '2026-05-12'),
  (@acc_bank, 2,               800.00, 'income',  'manual', 'Freelance project',  '2026-05-20'),
  (@acc_bank, @cat_fitness,     50.00, 'expense', 'manual', 'Gym membership',     '2026-05-22'),
  (@acc_bank, 3,               130.00, 'expense', 'manual', 'Supermarket',        '2026-05-25');

-- Main Account — June
INSERT INTO `Transactions`
  (account_id, category_id, amount, transaction_type, source_type, description, transaction_date)
VALUES
  (@acc_bank, 1,              2800.00, 'income',  'manual', 'Monthly salary',    '2026-06-01'),
  (@acc_bank, 3,               160.00, 'expense', 'manual', 'Supermarket',        '2026-06-03'),
  (@acc_bank, 4,                40.00, 'expense', 'manual', 'Transport',          '2026-06-05'),
  (@acc_bank, @cat_utilities,   80.00, 'expense', 'manual', 'Utilities',          '2026-06-08');

-- Credit Card — April
INSERT INTO `Transactions`
  (account_id, category_id, amount, transaction_type, source_type, description, transaction_date)
VALUES
  (@acc_cc, @cat_dining,  60.00, 'expense', 'manual', 'Dining out',    '2026-04-23'),
  (@acc_cc, 5,            25.00, 'expense', 'manual', 'Entertainment', '2026-04-25');

-- Credit Card — May
INSERT INTO `Transactions`
  (account_id, category_id, amount, transaction_type, source_type, description, transaction_date)
VALUES
  (@acc_cc, @cat_dining,  75.00, 'expense', 'manual', 'Dining out',    '2026-05-10'),
  (@acc_cc, 5,            30.00, 'expense', 'manual', 'Entertainment', '2026-05-15'),
  (@acc_cc, 7,           120.00, 'expense', 'manual', 'Clothing',      '2026-05-18');

-- Credit Card — June
INSERT INTO `Transactions`
  (account_id, category_id, amount, transaction_type, source_type, description, transaction_date)
VALUES
  (@acc_cc, @cat_dining,  55.00, 'expense', 'manual', 'Dining out',    '2026-06-10'),
  (@acc_cc, 5,            35.00, 'expense', 'manual', 'Entertainment', '2026-06-15');

-- ── 8. Goal contribution transactions ─────────────────────────
-- Each is an 'expense' with category_id = 19 (Goal Contribution, global).
-- Inserted individually so LAST_INSERT_ID() captures each transaction_id.
-- These IDs are then referenced in GoalContributions below.

INSERT INTO `Transactions`
  (account_id, category_id, amount, transaction_type, source_type, description, transaction_date)
VALUES (@acc_bank, 19, 200.00, 'expense', 'manual', 'Goal contribution: Emergency Fund', '2026-04-30');
SET @tx_gc1 = LAST_INSERT_ID();

INSERT INTO `Transactions`
  (account_id, category_id, amount, transaction_type, source_type, description, transaction_date)
VALUES (@acc_bank, 19, 300.00, 'expense', 'manual', 'Goal contribution: Emergency Fund', '2026-05-28');
SET @tx_gc2 = LAST_INSERT_ID();

INSERT INTO `Transactions`
  (account_id, category_id, amount, transaction_type, source_type, description, transaction_date)
VALUES (@acc_bank, 19, 200.00, 'expense', 'manual', 'Goal contribution: Summer Vacation', '2026-05-30');
SET @tx_gc3 = LAST_INSERT_ID();

INSERT INTO `Transactions`
  (account_id, category_id, amount, transaction_type, source_type, description, transaction_date)
VALUES (@acc_bank, 19, 150.00, 'expense', 'manual', 'Goal contribution: Summer Vacation', '2026-06-12');
SET @tx_gc4 = LAST_INSERT_ID();

-- ── 9. GoalContributions ───────────────────────────────────────
-- FK: goal_id → Goals, account_id → Accounts (both satisfied above).
-- transaction_id has no FK constraint — references real transactions anyway.
-- amount must be in goal currency (USD = account currency here, no conversion).

INSERT INTO `GoalContributions`
  (goal_id, account_id, amount, contribution_date, description,
   original_amount, original_currency_code, exchange_rate, transaction_id)
VALUES
  (@goal_emergency, @acc_bank, 200.00, '2026-04-30', NULL, NULL, NULL, NULL, @tx_gc1),
  (@goal_emergency, @acc_bank, 300.00, '2026-05-28', NULL, NULL, NULL, NULL, @tx_gc2),
  (@goal_vacation,  @acc_bank, 200.00, '2026-05-30', NULL, NULL, NULL, NULL, @tx_gc3),
  (@goal_vacation,  @acc_bank, 150.00, '2026-06-12', NULL, NULL, NULL, NULL, @tx_gc4);

-- ── 10. Investments ────────────────────────────────────────────
-- investment_type enum: 'stock' | 'crypto' | 'real_estate' | 'other'

INSERT INTO `Investments`
  (user_id, investment_name, symbol, investment_type, quantity,
   purchase_price, current_price, currency_id, purchase_date, notes)
VALUES
  (@uid, 'Apple Inc.', 'AAPL', 'stock',  10.0000, 180.00, 211.30, 1, '2026-04-20', 'Long-term hold'),
  (@uid, 'Bitcoin',    'BTC',  'crypto',  0.0500, 60000.00, 67500.00, 1, '2026-05-05', 'Dollar-cost averaging');

-- ── 11. Bills ──────────────────────────────────────────────────
-- recurrence_type enum: 'monthly' | 'yearly' | 'none'
-- category_id FK → Categories (cat 5 and @cat_fitness both exist at this point).
-- paid_transaction_id is NULL (bills are unpaid — due in the future).

INSERT INTO `Bills`
  (user_id, name, amount, due_date, recurrence_type, category_id, currency_id, is_paid, paid_transaction_id)
VALUES (@uid, 'Netflix',        15.99, '2026-06-20', 'monthly', 5,            1, 0, NULL);
SET @bill_netflix = LAST_INSERT_ID();

INSERT INTO `Bills`
  (user_id, name, amount, due_date, recurrence_type, category_id, currency_id, is_paid, paid_transaction_id)
VALUES (@uid, 'Gym Membership', 50.00, '2026-06-22', 'monthly', @cat_fitness, 1, 0, NULL);
SET @bill_gym = LAST_INSERT_ID();

-- ── 12. Reminders ──────────────────────────────────────────────
-- reminder_date = due_date – days_before days.
-- FK: user_id → Users, bill_id → Bills (both satisfied above).

INSERT INTO `Reminders`
  (user_id, bill_id, days_before, message, reminder_date, is_sent)
VALUES
  (@uid, @bill_netflix, 3,
   'Your bill "Netflix" of $15.99 is due in 3 days on June 20, 2026.',
   '2026-06-17 00:00:00', 0),
  (@uid, @bill_gym, 3,
   'Your bill "Gym Membership" of $50.00 is due in 3 days on June 22, 2026.',
   '2026-06-19 00:00:00', 0);

COMMIT;
