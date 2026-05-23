-- Migration: fix ChatSessions.ended_at zero-date incompatibility
--
-- Production MySQL runs with strict mode (NO_ZERO_DATE / NO_ZERO_IN_DATE),
-- which rejects '0000-00-00 00:00:00' as a TIMESTAMP value. The column used
-- that zero-date as the sentinel for "session still active". This migration
-- converts it to NULL, which is the correct representation and works in all
-- MySQL configurations.
--
-- Run this ONCE on the production database, then deploy the updated ChatDAL.php.

-- Step 1: change the column to allow NULL and default to NULL
ALTER TABLE `ChatSessions`
  MODIFY `ended_at` TIMESTAMP NULL DEFAULT NULL;

-- Step 2: convert any existing zero-date rows to NULL (active sessions)
UPDATE `ChatSessions`
  SET `ended_at` = NULL
  WHERE `ended_at` = '0000-00-00 00:00:00';
