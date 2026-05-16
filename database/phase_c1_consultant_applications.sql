-- Phase C1: Consultant Applications
-- Run this in phpMyAdmin before deploying the Phase C1 code.

-- Extend AdminNotifications type ENUM to include consultant_application
ALTER TABLE AdminNotifications
  MODIFY COLUMN type ENUM(
    'user_registered','user_suspended',
    'consultant_added','consultant_deleted',
    'category_added','category_deleted',
    'system','consultant_application'
  ) DEFAULT 'system';

CREATE TABLE IF NOT EXISTS ConsultantApplications (
    application_id  INT           AUTO_INCREMENT PRIMARY KEY,
    first_name      VARCHAR(100)  NOT NULL,
    last_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(255)  NOT NULL,
    phone           VARCHAR(50)   DEFAULT NULL,
    specialization  VARCHAR(100)  NOT NULL,
    years_experience INT          DEFAULT 0,
    bio             TEXT          NOT NULL,
    motivation      TEXT          NOT NULL,
    linkedin_url    VARCHAR(255)  DEFAULT NULL,
    status          ENUM('pending','approved','rejected') DEFAULT 'pending',
    admin_note      TEXT          DEFAULT NULL,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    reviewed_at     TIMESTAMP     NULL DEFAULT NULL
);
