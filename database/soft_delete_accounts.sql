-- Soft delete support for Accounts
-- Adds a nullable deleted_at timestamp; NULL means active, non-NULL means deleted.
-- No data is removed — transactions, goal contributions, and bill payments are preserved.

ALTER TABLE `Accounts`
  ADD COLUMN `deleted_at` DATETIME NULL DEFAULT NULL AFTER `created_at`;
