-- ============================================================
-- FinHub — Phase 1: Consultant Redesign DB Migration
-- Run this entire file in phpMyAdmin (Import tab) BEFORE
-- applying any of the Phase 1 PHP/JS code changes.
-- All changes are additive — existing data is unaffected.
-- ============================================================

USE FinHub;

-- ── 1A. Extend Consultants table ──────────────────────────────
-- All new columns are nullable or have safe defaults.
-- Existing rows are unaffected.

ALTER TABLE `Consultants`
  ADD COLUMN `bio`                 TEXT          DEFAULT NULL,
  ADD COLUMN `sub_skills`          TEXT          DEFAULT NULL COMMENT 'JSON array e.g. ["Debt Consolidation","Credit Score"]',
  ADD COLUMN `languages`           TEXT          DEFAULT NULL COMMENT 'JSON array e.g. ["Arabic","English"]',
  ADD COLUMN `years_experience`    INT           DEFAULT NULL,
  ADD COLUMN `availability_status` ENUM('available','busy','unavailable') DEFAULT 'available',
  ADD COLUMN `fee_structure`       TEXT          DEFAULT NULL COMMENT 'JSON e.g. {"free_intro":true,"session_fee":null}',
  ADD COLUMN `is_verified`         TINYINT(1)    DEFAULT 0,
  ADD COLUMN `is_featured`         TINYINT(1)    DEFAULT 0,
  ADD COLUMN `case_studies`        TEXT          DEFAULT NULL COMMENT 'JSON array of {title, description} objects';

-- ── 1B. Seed existing consultants with rich profile data ──────
-- Verify consultant_id values match your DB before running:
-- consultant_id 1 = Michel Aoun (Investment)
-- consultant_id 2 = Lara Khoury (Debt Management)
-- consultant_id 3 = Karim Saad (Savings)
-- consultant_id 4 = Zahraa Zahraman (Savings)

UPDATE `Consultants` SET
  bio                 = 'Investment advisor with focus on equities, cryptocurrency, and emerging market funds. Helps clients build diversified portfolios aligned with their risk tolerance.',
  sub_skills          = '["Stock Portfolio","Cryptocurrency","Risk Assessment","Diversification Strategy","Market Analysis"]',
  languages           = '["Arabic","English","French"]',
  years_experience    = 10,
  availability_status = 'available',
  fee_structure       = '{"free_intro":true,"session_fee":null}',
  is_verified         = 1,
  is_featured         = 1,
  case_studies        = '[{"title":"167% portfolio gain in 8 months","description":"Guided a client into a diversified tech and emerging market position that significantly outperformed the benchmark."},{"title":"Crypto risk containment","description":"Helped a client re-balance a crypto-heavy portfolio to reduce volatility exposure while maintaining upside potential."}]'
WHERE consultant_id = 1;

UPDATE `Consultants` SET
  bio                 = 'Specializes in helping individuals restructure personal debt and improve credit health. Over 8 years working with households across Lebanon.',
  sub_skills          = '["Debt Consolidation","Credit Counseling","Budget Planning","Credit Score Recovery"]',
  languages           = '["Arabic","English"]',
  years_experience    = 8,
  availability_status = 'available',
  fee_structure       = '{"free_intro":true,"session_fee":null}',
  is_verified         = 1,
  case_studies        = '[{"title":"Reduced monthly debt burden by 40%","description":"Helped a client restructure three overlapping loans into a single plan, freeing up $400/month within 6 months."},{"title":"Credit score recovery in 12 months","description":"Guided a client from a low credit rating to a bankable score through disciplined repayment scheduling and credit utilization management."}]'
WHERE consultant_id = 2;

UPDATE `Consultants` SET
  bio                 = 'Savings strategist focused on helping individuals build emergency funds, plan major purchases, and develop long-term financial habits.',
  sub_skills          = '["Emergency Fund Planning","Goal-Based Savings","Expense Tracking","Financial Habits"]',
  languages           = '["Arabic","English"]',
  years_experience    = 5,
  availability_status = 'available',
  fee_structure       = '{"free_intro":true,"session_fee":null}',
  is_verified         = 0,
  case_studies        = '[{"title":"$10,000 emergency fund in 14 months","description":"Worked with a client earning a modest income to systematically build a full emergency fund from scratch through automated savings protocols."}]'
WHERE consultant_id = 3;

UPDATE `Consultants` SET
  bio                 = 'Savings and personal finance consultant with a background in financial technology. Specializes in helping young professionals manage income, build savings, and track goals.',
  sub_skills          = '["Personal Finance","Savings Automation","Goal Tracking","Budgeting for Beginners"]',
  languages           = '["Arabic","English"]',
  years_experience    = 3,
  availability_status = 'available',
  fee_structure       = '{"free_intro":true,"session_fee":null}',
  is_verified         = 1,
  case_studies        = '[{"title":"Goal completed in half the projected time","description":"Helped a client reorganize monthly spending to accelerate a savings goal, achieving it 7 months ahead of schedule."}]'
WHERE consultant_id = 4;

-- ── 1C. Create ConsultantInquiries table ──────────────────────

CREATE TABLE IF NOT EXISTS `ConsultantInquiries` (
  `inquiry_id`    int(11)      NOT NULL AUTO_INCREMENT,
  `user_id`       int(11)      NOT NULL,
  `consultant_id` int(11)      NOT NULL,
  `brief_text`    TEXT         DEFAULT NULL COMMENT 'AI-generated financial brief sent to consultant',
  `user_note`     TEXT         DEFAULT NULL COMMENT 'User-written message',
  `situation_tag` VARCHAR(100) DEFAULT NULL COMMENT 'The need category selected during matching',
  `status`        ENUM('pending','responded','closed') DEFAULT 'pending',
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`inquiry_id`),
  KEY `user_id`       (`user_id`),
  KEY `consultant_id` (`consultant_id`),
  CONSTRAINT `inquiries_ibfk_1` FOREIGN KEY (`user_id`)       REFERENCES `Users`       (`user_id`),
  CONSTRAINT `inquiries_ibfk_2` FOREIGN KEY (`consultant_id`) REFERENCES `Consultants` (`consultant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 1D. Create ConsultantReviews table ────────────────────────

CREATE TABLE IF NOT EXISTS `ConsultantReviews` (
  `review_id`             int(11)  NOT NULL AUTO_INCREMENT,
  `inquiry_id`            int(11)  NOT NULL,
  `user_id`               int(11)  NOT NULL,
  `consultant_id`         int(11)  NOT NULL,
  `rating_clarity`        TINYINT  NOT NULL,
  `rating_responsiveness` TINYINT  NOT NULL,
  `rating_actionability`  TINYINT  NOT NULL,
  `review_text`           TEXT     DEFAULT NULL,
  `created_at`            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `unique_inquiry_review` (`inquiry_id`) COMMENT 'One review per inquiry only',
  KEY `user_id`       (`user_id`),
  KEY `consultant_id` (`consultant_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`inquiry_id`)    REFERENCES `ConsultantInquiries` (`inquiry_id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`)       REFERENCES `Users`               (`user_id`),
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`consultant_id`) REFERENCES `Consultants`         (`consultant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ── 1E. Extend enum columns ───────────────────────────────────

ALTER TABLE `Notifications`
  MODIFY `type` ENUM('bill','goal','insight','system','consultant_inquiry','inquiry_response') DEFAULT NULL;

ALTER TABLE `EmailLogs`
  MODIFY `email_type` ENUM('weekly_summary','reminder','inquiry_notification') DEFAULT NULL;

-- ── Done ──────────────────────────────────────────────────────
-- After running this file successfully, apply the Phase 1
-- PHP and JS code changes.
