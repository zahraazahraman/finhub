-- Phase C4: Consultant Dashboard
-- Run this in phpMyAdmin before deploying Phase C4 code.

ALTER TABLE ConsultantInquiries
    ADD COLUMN consultant_reply TEXT         DEFAULT NULL AFTER situation_tag,
    ADD COLUMN replied_at       TIMESTAMP    NULL DEFAULT NULL AFTER consultant_reply;
