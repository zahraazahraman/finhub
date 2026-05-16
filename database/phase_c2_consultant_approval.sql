-- Phase C2: Consultant Approval Workflow
-- Run this in phpMyAdmin before deploying Phase C2 code.

ALTER TABLE Consultants
    ADD COLUMN password           VARCHAR(255) DEFAULT NULL AFTER rating,
    ADD COLUMN must_change_password TINYINT(1)  DEFAULT 1   AFTER password,
    ADD COLUMN application_id     INT          DEFAULT NULL AFTER must_change_password;
