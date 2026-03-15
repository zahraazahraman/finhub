-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 12, 2026 at 01:02 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `FinHub`
--

-- --------------------------------------------------------

--
-- Table structure for table `Accounts`
--

CREATE TABLE `Accounts` (
  `account_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `account_name` varchar(100) DEFAULT NULL,
  `account_type` enum('bank','cash','credit_card','wallet') DEFAULT NULL,
  `currency_id` int(11) DEFAULT NULL,
  `balance` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Bills`
--

CREATE TABLE `Bills` (
  `bill_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `recurrence_type` enum('monthly','yearly','none') DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `is_paid` tinyint(1) DEFAULT 0,
  `paid_transaction_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Categories`
--

CREATE TABLE `Categories` (
  `category_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `type` enum('income','expense') DEFAULT NULL,
  `parent_category_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ChatMessages`
--

CREATE TABLE `ChatMessages` (
  `message_id` int(11) NOT NULL,
  `chat_session_id` int(11) NOT NULL,
  `sender_type` enum('user','ai') DEFAULT NULL,
  `message_text` text DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ChatSessions`
--

CREATE TABLE `ChatSessions` (
  `chat_session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ended_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ConsultantBookings`
--

CREATE TABLE `ConsultantBookings` (
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `consultant_id` int(11) NOT NULL,
  `booking_date` datetime DEFAULT NULL,
  `status` enum('pending','confirmed','completed','cancelled') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Consultants`
--

CREATE TABLE `Consultants` (
  `consultant_id` int(11) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Currencies`
--

CREATE TABLE `Currencies` (
  `currency_id` int(11) NOT NULL,
  `code` varchar(10) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `symbol` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `EmailLogs`
--

CREATE TABLE `EmailLogs` (
  `email_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email_type` enum('weekly_summary','reminder') DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('sent','failed') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `GoalContributions`
--

CREATE TABLE `GoalContributions` (
  `contribution_id` int(11) NOT NULL,
  `goal_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `contribution_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Goals`
--

CREATE TABLE `Goals` (
  `goal_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `goal_name` varchar(100) DEFAULT NULL,
  `goal_type` enum('saving','debt_repayment') DEFAULT NULL,
  `target_amount` decimal(12,2) DEFAULT NULL,
  `current_amount` decimal(12,2) DEFAULT 0.00,
  `deadline` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Insights`
--

CREATE TABLE `Insights` (
  `insight_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `insight_type` enum('spending_pattern','anomaly','suggestion') DEFAULT NULL,
  `content` text DEFAULT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Investments`
--

CREATE TABLE `Investments` (
  `investment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `investment_name` varchar(255) NOT NULL,
  `symbol` varchar(20) DEFAULT NULL,
  `investment_type` enum('stock','crypto','real_estate','other') NOT NULL,
  `quantity` decimal(15,4) DEFAULT NULL,
  `purchase_price` decimal(12,2) DEFAULT NULL,
  `current_price` decimal(12,2) DEFAULT NULL,
  `currency_id` int(11) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Notifications`
--

CREATE TABLE `Notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('bill','goal','insight','system') DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Reminders`
--

CREATE TABLE `Reminders` (
  `reminder_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `bill_id` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `reminder_date` datetime DEFAULT NULL,
  `is_sent` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Transactions`
--

CREATE TABLE `Transactions` (
  `transaction_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `transaction_type` enum('income','expense','transfer') NOT NULL,
  `source_type` enum('manual','csv','receipt') DEFAULT 'manual',
  `receipt_image_url` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone_number` varchar(30) DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `email_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UserSessions`
--

CREATE TABLE `UserSessions` (
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Accounts`
--
ALTER TABLE `Accounts`
  ADD PRIMARY KEY (`account_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `currency_id` (`currency_id`);

--
-- Indexes for table `Bills`
--
ALTER TABLE `Bills`
  ADD PRIMARY KEY (`bill_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `fk_bill_payment` (`paid_transaction_id`);

--
-- Indexes for table `Categories`
--
ALTER TABLE `Categories`
  ADD PRIMARY KEY (`category_id`),
  ADD KEY `parent_category_id` (`parent_category_id`),
  ADD KEY `fk_category_user` (`user_id`);

--
-- Indexes for table `ChatMessages`
--
ALTER TABLE `ChatMessages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `chat_session_id` (`chat_session_id`);

--
-- Indexes for table `ChatSessions`
--
ALTER TABLE `ChatSessions`
  ADD PRIMARY KEY (`chat_session_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `ConsultantBookings`
--
ALTER TABLE `ConsultantBookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `consultant_id` (`consultant_id`);

--
-- Indexes for table `Consultants`
--
ALTER TABLE `Consultants`
  ADD PRIMARY KEY (`consultant_id`);

--
-- Indexes for table `Currencies`
--
ALTER TABLE `Currencies`
  ADD PRIMARY KEY (`currency_id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `EmailLogs`
--
ALTER TABLE `EmailLogs`
  ADD PRIMARY KEY (`email_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `GoalContributions`
--
ALTER TABLE `GoalContributions`
  ADD PRIMARY KEY (`contribution_id`),
  ADD KEY `goal_id` (`goal_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Indexes for table `Goals`
--
ALTER TABLE `Goals`
  ADD PRIMARY KEY (`goal_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `Insights`
--
ALTER TABLE `Insights`
  ADD PRIMARY KEY (`insight_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `Investments`
--
ALTER TABLE `Investments`
  ADD PRIMARY KEY (`investment_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `currency_id` (`currency_id`);

--
-- Indexes for table `Notifications`
--
ALTER TABLE `Notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `Reminders`
--
ALTER TABLE `Reminders`
  ADD PRIMARY KEY (`reminder_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `bill_id` (`bill_id`);

--
-- Indexes for table `Transactions`
--
ALTER TABLE `Transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `UserSessions`
--
ALTER TABLE `UserSessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Accounts`
--
ALTER TABLE `Accounts`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Bills`
--
ALTER TABLE `Bills`
  MODIFY `bill_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Categories`
--
ALTER TABLE `Categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ChatMessages`
--
ALTER TABLE `ChatMessages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ChatSessions`
--
ALTER TABLE `ChatSessions`
  MODIFY `chat_session_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ConsultantBookings`
--
ALTER TABLE `ConsultantBookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Consultants`
--
ALTER TABLE `Consultants`
  MODIFY `consultant_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Currencies`
--
ALTER TABLE `Currencies`
  MODIFY `currency_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `EmailLogs`
--
ALTER TABLE `EmailLogs`
  MODIFY `email_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `GoalContributions`
--
ALTER TABLE `GoalContributions`
  MODIFY `contribution_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Goals`
--
ALTER TABLE `Goals`
  MODIFY `goal_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Insights`
--
ALTER TABLE `Insights`
  MODIFY `insight_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Investments`
--
ALTER TABLE `Investments`
  MODIFY `investment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Notifications`
--
ALTER TABLE `Notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Reminders`
--
ALTER TABLE `Reminders`
  MODIFY `reminder_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Transactions`
--
ALTER TABLE `Transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UserSessions`
--
ALTER TABLE `UserSessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Accounts`
--
ALTER TABLE `Accounts`
  ADD CONSTRAINT `accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  ADD CONSTRAINT `accounts_ibfk_2` FOREIGN KEY (`currency_id`) REFERENCES `Currencies` (`currency_id`);

--
-- Constraints for table `Bills`
--
ALTER TABLE `Bills`
  ADD CONSTRAINT `bills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  ADD CONSTRAINT `bills_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `Categories` (`category_id`),
  ADD CONSTRAINT `fk_bill_payment` FOREIGN KEY (`paid_transaction_id`) REFERENCES `Transactions` (`transaction_id`);

--
-- Constraints for table `Categories`
--
ALTER TABLE `Categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_category_id`) REFERENCES `Categories` (`category_id`),
  ADD CONSTRAINT `fk_category_user` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

--
-- Constraints for table `ChatMessages`
--
ALTER TABLE `ChatMessages`
  ADD CONSTRAINT `chatmessages_ibfk_1` FOREIGN KEY (`chat_session_id`) REFERENCES `ChatSessions` (`chat_session_id`);

--
-- Constraints for table `ChatSessions`
--
ALTER TABLE `ChatSessions`
  ADD CONSTRAINT `chatsessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

--
-- Constraints for table `ConsultantBookings`
--
ALTER TABLE `ConsultantBookings`
  ADD CONSTRAINT `consultantbookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  ADD CONSTRAINT `consultantbookings_ibfk_2` FOREIGN KEY (`consultant_id`) REFERENCES `Consultants` (`consultant_id`);

--
-- Constraints for table `EmailLogs`
--
ALTER TABLE `EmailLogs`
  ADD CONSTRAINT `emaillogs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

--
-- Constraints for table `GoalContributions`
--
ALTER TABLE `GoalContributions`
  ADD CONSTRAINT `goalcontributions_ibfk_1` FOREIGN KEY (`goal_id`) REFERENCES `Goals` (`goal_id`),
  ADD CONSTRAINT `goalcontributions_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `Accounts` (`account_id`);

--
-- Constraints for table `Goals`
--
ALTER TABLE `Goals`
  ADD CONSTRAINT `goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

--
-- Constraints for table `Insights`
--
ALTER TABLE `Insights`
  ADD CONSTRAINT `insights_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

--
-- Constraints for table `Investments`
--
ALTER TABLE `Investments`
  ADD CONSTRAINT `investments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  ADD CONSTRAINT `investments_ibfk_2` FOREIGN KEY (`currency_id`) REFERENCES `Currencies` (`currency_id`);

--
-- Constraints for table `Notifications`
--
ALTER TABLE `Notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);

--
-- Constraints for table `Reminders`
--
ALTER TABLE `Reminders`
  ADD CONSTRAINT `reminders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  ADD CONSTRAINT `reminders_ibfk_2` FOREIGN KEY (`bill_id`) REFERENCES `Bills` (`bill_id`);

--
-- Constraints for table `Transactions`
--
ALTER TABLE `Transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `Accounts` (`account_id`),
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `Categories` (`category_id`);

--
-- Constraints for table `UserSessions`
--
ALTER TABLE `UserSessions`
  ADD CONSTRAINT `usersessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
