-- Migration: encrypt ChatMessages.message_text with AES-256-GCM
--
-- message_text already has enough capacity as TEXT to hold the base64 blob
-- (nonce 12 + ciphertext + tag 16 → ~4/3 overhead, well within TEXT limits).
-- No column type change is needed — the column stays TEXT.
--
-- All existing rows are plaintext test data and must be removed before
-- the new code runs, otherwise decryption will throw on the old rows.

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ChatMessages;
TRUNCATE TABLE ChatSessions;
SET FOREIGN_KEY_CHECKS = 1;
