-- Password reset token support for Consultants
-- Mirrors the same columns used on Users and Admins tables.

ALTER TABLE `Consultants`
  ADD COLUMN `reset_token`            VARCHAR(64)  NULL DEFAULT NULL AFTER `must_change_password`,
  ADD COLUMN `reset_token_expires_at` DATETIME     NULL DEFAULT NULL AFTER `reset_token`;
