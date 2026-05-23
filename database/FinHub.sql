-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 11, 2026 at 07:18 PM
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

--
-- Dumping data for table `Accounts`
--

INSERT INTO `Accounts` (`account_id`, `user_id`, `account_name`, `account_type`, `currency_id`, `balance`, `created_at`) VALUES
(2, 7, 'WishMoney', 'credit_card', 1, 10088.20, '2026-04-05 14:05:52'),
(4, 7, 'new account', 'credit_card', 2, 745.46, '2026-04-17 03:49:49'),
(5, 7, 'OMT', 'wallet', 1, 0.00, '2026-05-02 11:13:48'),
(6, 7, 'another account', 'credit_card', 8, 100.00, '2026-05-02 11:14:05'),
(7, 7, 'blabla', 'wallet', 10, 0.00, '2026-05-02 11:15:23'),
(8, 7, 'new account 3', 'credit_card', 6, 0.00, '2026-05-02 11:15:52'),
(9, 7, '12 account', 'wallet', 9, 0.00, '2026-05-03 09:20:49'),
(10, 7, 'your account', 'credit_card', 10, 0.00, '2026-05-03 09:24:05');

-- --------------------------------------------------------

--
-- Table structure for table `AdminNotifications`
--

CREATE TABLE `AdminNotifications` (
  `notification_id` int(11) NOT NULL,
  `type` enum('user_registered','user_suspended','consultant_added','consultant_deleted','category_added','category_deleted','system') DEFAULT 'system',
  `title` varchar(200) NOT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `AdminNotifications`
--

INSERT INTO `AdminNotifications` (`notification_id`, `type`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 'user_registered', 'New User Registered', 'Zahraa Zahraman just created an account.', 1, '2026-03-13 13:15:57'),
(2, 'consultant_added', 'New Consultant Added', 'Michel Aoun was added as a consultant.', 1, '2026-03-13 13:15:57'),
(3, 'user_suspended', 'User Suspended', 'Ali Hassan has been suspended.', 1, '2026-03-13 13:15:57'),
(4, 'system', 'System Update', 'FinHub backend was updated successfully.', 1, '2026-03-13 13:15:57'),
(5, 'category_added', 'New Category Added', 'Category \"Clothing\" (expense) was created.', 1, '2026-03-15 12:09:21'),
(6, 'category_deleted', 'Category Deleted', 'Category \"Clothing\" was deleted.', 1, '2026-03-15 12:19:26'),
(7, 'user_suspended', 'User Suspended', 'Zahraa Zahraman has been suspended.', 1, '2026-03-15 13:31:00'),
(8, 'user_registered', 'User Activated', 'Zahraa Zahraman has been reactivated.', 1, '2026-03-15 13:44:24'),
(9, 'user_suspended', 'User Suspended', 'Ali Hassan has been suspended.', 1, '2026-03-15 13:44:28'),
(10, 'category_added', 'New Category Added', 'Category \"Clothing\" (expense) was created.', 1, '2026-03-15 13:44:46'),
(11, 'user_suspended', 'User Deleted', 'TEST ACCOUNT has been deleted.', 1, '2026-03-30 07:25:27'),
(12, 'user_suspended', 'User Suspended', 'Ali Hassan has been suspended.', 1, '2026-03-30 07:25:47'),
(13, 'category_added', 'New Category Added', 'Category \"TESTING\" (expense) was created.', 1, '2026-03-30 07:28:50'),
(14, 'category_deleted', 'Category Deleted', 'Category \"TESTING\" was deleted.', 1, '2026-03-30 07:28:58'),
(15, 'user_suspended', 'User Deleted', 'NEW ACCOUNT has been deleted.', 1, '2026-04-01 08:12:43'),
(16, 'consultant_added', 'New Consultant Added', 'Zahraa Zahraman was added as a consultant.', 1, '2026-04-01 08:16:17'),
(17, 'category_added', 'New Category Added', 'Category \"TESTING\" (income) was created.', 1, '2026-04-04 10:49:21'),
(18, 'category_deleted', 'Category Deleted', 'Category \"TESTING\" was deleted.', 1, '2026-04-04 10:50:59'),
(19, 'category_added', 'New Category Added', 'Category \"ADD ANOTHER\" (expense) was created.', 1, '2026-04-04 10:51:28'),
(20, 'user_suspended', 'User Suspended', 'TEST ACCOUNT has been suspended.', 1, '2026-04-04 10:57:29'),
(21, 'user_suspended', 'User Deleted', 'TEST ACCOUNT has been deleted.', 1, '2026-04-04 10:57:44'),
(22, 'consultant_added', 'New Consultant Added', 'Zahraa Zahraman was added as a consultant.', 1, '2026-04-04 10:59:05'),
(23, 'category_added', 'New Category Added', 'Category \"ADD ANOTHER\" (expense) was created.', 1, '2026-04-04 11:02:58'),
(24, 'category_added', 'New Category Added', 'Category \"ADD ANOTHER\" (income) was created.', 1, '2026-04-04 11:16:37'),
(25, 'category_deleted', 'Category Deleted', 'Category \"ADD ANOTHER\" was deleted.', 1, '2026-04-04 11:16:41'),
(26, 'category_deleted', 'Category Deleted', 'Category \"ADD ANOTHER\" was deleted.', 1, '2026-04-04 11:16:46'),
(27, 'category_deleted', 'Category Deleted', 'Category \"ADD ANOTHER\" was deleted.', 1, '2026-04-04 11:16:50'),
(28, 'consultant_deleted', 'Consultant Deleted', 'Zahraa Zahraman was removed.', 1, '2026-04-04 11:17:26'),
(29, 'category_added', 'New Category Added', 'Category \"ADD ANOTHER\" (expense) was created.', 1, '2026-04-04 11:27:52'),
(30, 'category_deleted', 'Category Deleted', 'Category \"ADD ANOTHER\" was deleted.', 1, '2026-04-04 11:29:46'),
(31, 'category_added', 'New Category Added', 'Category \"ADD ANOTHER\" (expense) was created.', 1, '2026-04-04 11:37:36'),
(32, 'user_suspended', 'User Suspended', 'TEST ACCOUNT has been suspended.', 1, '2026-04-07 07:22:57'),
(33, 'user_registered', 'User Activated', 'TEST ACCOUNT has been reactivated.', 0, '2026-04-07 07:24:41');

-- --------------------------------------------------------

--
-- Table structure for table `Admins`
--

CREATE TABLE `Admins` (
  `admin_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Admins`
--

INSERT INTO `Admins` (`admin_id`, `email`, `password_hash`, `created_at`, `reset_token`, `reset_token_expires_at`) VALUES
(1, 'admin@finhub.com', '$2y$10$PvHhKwdDiIpHdIxNQMEaouGNQTSfmRv4O9p70IeDaWiY64vjbzadK', '2026-03-13 07:20:12', NULL, NULL);

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
  `currency_id` int(11) NOT NULL DEFAULT 1,
  `is_paid` tinyint(1) DEFAULT 0,
  `paid_transaction_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Bills`
--

INSERT INTO `Bills` (`bill_id`, `user_id`, `name`, `amount`, `due_date`, `recurrence_type`, `category_id`, `currency_id`, `is_paid`, `paid_transaction_id`) VALUES
(1, 7, 'Spotify', 2.99, '2026-05-10', 'monthly', 16, 1, 0, NULL),
(2, 7, 'University Installment', 850.00, '2026-05-06', 'none', 16, 1, 0, NULL),
(4, 7, 'netflix', 16.00, '2026-05-21', 'monthly', 5, 1, 1, NULL),
(5, 7, 'netflix', 16.00, '2026-06-21', 'monthly', 5, 1, 0, NULL),
(6, 7, 'tomorrow', 100.00, '2026-05-05', 'none', NULL, 12, 0, NULL);

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

--
-- Dumping data for table `Categories`
--

INSERT INTO `Categories` (`category_id`, `name`, `type`, `parent_category_id`, `user_id`) VALUES
(1, 'Salary', 'income', NULL, NULL),
(2, 'Freelance', 'income', NULL, NULL),
(3, 'Food & Drinks', 'expense', NULL, NULL),
(4, 'Transport', 'expense', NULL, NULL),
(5, 'Entertainment', 'expense', NULL, NULL),
(7, 'Clothing', 'expense', NULL, NULL),
(15, 'Consulting', 'income', NULL, 7),
(16, 'Utilities', 'expense', NULL, 7),
(17, 'Fitness', 'expense', NULL, 7),
(18, 'Café', 'expense', NULL, 7),
(19, 'Goal Contribution', 'expense', NULL, NULL);

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

--
-- Dumping data for table `ChatMessages`
--

INSERT INTO `ChatMessages` (`message_id`, `chat_session_id`, `sender_type`, `message_text`, `sent_at`) VALUES
(1, 1, 'user', 'How is my portfolio performing overall?', '2026-04-29 15:38:12'),
(2, 1, 'ai', 'Based on the data from your FinHub account, let\'s review your portfolio\'s performance:\n\nYou have a mix of investments in stocks and real estate. The overall profit/loss (P/L) from your investments is:\n\n- Bitcoin (2 positions): -66 USD and -32.39 USD = -98.39 USD\n- New Investment (2 positions): -71.06 EUR and +502.83 USD (note: different currencies) = approximately -71.06 EUR + 502.83 USD\n- Apartement (Real estate): +5000 USD\n- Test Stock: +50 USD\n\nConsidering the currency difference, let\'s focus on the USD-denominated investments. The total P/L from USD investments is: -98.39 USD + 502.83 USD + 5000 USD + 50 USD = approximately +5454.44 USD\n\nYour portfolio has a significant gain, primarily driven by the appreciation of your real estate investment (Apartement) and one of your New Investment positions. However, it\'s essential to remember that past performance is not a guarantee of future results.\n\nTo get a more comprehensive view, I recommend considering your overall financial goals, risk tolerance, and time horizon. Would you like to discuss any specific aspects of your portfolio or explore strategies for optimization?', '2026-04-29 15:38:14'),
(3, 1, 'user', 'can you speak to me in simpler words, i am still a beginner.', '2026-04-29 15:38:47'),
(4, 1, 'ai', 'Let\'s look at your investments:\n\n* You have some stocks (like Bitcoin) that are not doing well.\n* You have a real estate investment (an apartment) that is doing very well, it\'s worth $5,000 more than you bought it for.\n* You have some other stocks that are doing okay.\n\nOverall, your investments are making money, mostly because of the apartment. This is good news!\n\nBut remember, investments can go up and down in value. It\'s essential to be patient and not worry too much about short-term changes.\n\nWhat would you like to know or do next? Do you want to talk about your financial goals or something else?', '2026-04-29 15:38:49'),
(5, 2, 'user', 'Which of my goals should I focus on first?', '2026-04-29 15:47:59'),
(6, 2, 'ai', 'Based on your financial data, I recommend focusing on the \"Surgery (Saving)\" goal first. This goal has a relatively small target amount of $1,000.00 USD, and you\'ve already made some progress with $23.56 saved. \n\nBy prioritizing this goal, you can quickly achieve a sense of accomplishment and free up mental energy to tackle your other goals, such as the \"Brownies\" and \"Phone\" goals. Additionally, completing this goal may alleviate any financial stress or uncertainty related to the surgery, allowing you to focus on your other financial objectives. \n\nConsidering your current net positive income of $580.00 this month, you may want to allocate a portion of this amount towards your \"Surgery\" goal to make steady progress.', '2026-04-29 15:48:01'),
(7, 3, 'user', 'How is my portfolio performing overall?', '2026-04-30 01:52:53'),
(8, 3, 'ai', 'Based on your investment data, your portfolio has a mix of gains and losses. The positive performers are:\n\n* Apartement (Real estate): +$5,000 (20% gain)\n* New Investment (Stock, bought at $100 USD): +$502.83 (167.6% gain, considering 3 units)\n* Test Stock (Stock): +$50 (10% gain)\n\nHowever, there are also losses:\n* Bitcoin (Stock, bought at $100 USD): -$66 (66% loss)\n* Bitcoin (Stock, bought at $300 USD): -$32.39 (10.8% loss)\n* New Investment (Stock, bought at $100 EUR): -$71.06 (71.06% loss)\n\nConsidering the overall picture, it\'s essential to assess your investment strategy and risk tolerance. I recommend reviewing your portfolio to determine if it\'s aligned with your financial goals and adjusting it as needed to minimize losses and maximize gains. Would you like me to suggest a specific course of action or provide more insights on a particular investment?', '2026-04-30 01:52:55'),
(9, 3, 'user', 'hello', '2026-04-30 02:19:24'),
(10, 3, 'ai', 'Hello. I\'m here to help with your finances. Is there something specific you\'d like to discuss or a question you have about your portfolio? I can see that you have multiple financial goals, such as saving for \"Brownies\" and repaying debt for your \"Phone\". Would you like me to provide guidance on how to prioritize or achieve these goals?', '2026-04-30 02:19:25'),
(11, 4, 'user', 'can you talk to me about the wether.', '2026-04-30 03:56:12'),
(12, 4, 'ai', 'I\'m happy to chat with you, but as your FinHub AI Financial Consultant, my expertise is in personal finance. I\'d be delighted to discuss your financial goals, investments, or provide guidance on managing your accounts. If you\'re concerned about how weather-related events might impact your finances, I can offer advice on that. However, for general weather discussions, I recommend checking a reliable weather forecast website or app. Would you like to explore how I can assist you with your financial situation instead?', '2026-04-30 03:56:13'),
(13, 5, 'user', 'Which of my goals should I focus on first?', '2026-04-30 05:36:57'),
(14, 5, 'ai', 'Considering your financial snapshot, I recommend focusing on the \"Surgery (Saving)\" goal first. You\'ve already made some progress, with 23.56 USD saved, and the goal amount is relatively small (1,000.00 USD). Completing this goal will likely give you a sense of accomplishment and free up mental energy to tackle your other goals.\n\nAdditionally, having a completed goal can help build momentum and encourage you to focus on your other objectives, such as the \"Brownies (Saving)\" goal, which is a much larger target (100,000.00 LBP).', '2026-04-30 05:36:58'),
(15, 6, 'user', 'How is my portfolio performing overall?', '2026-05-03 10:06:57'),
(16, 6, 'ai', 'Based on the provided data, your investment portfolio has a mix of positive and negative performances. \n\nThe positive performances include:\n- Apartement (Real estate): +$5,000 (20% gain)\n- New Investment (Stock) (qty 3.0000): +$540.42 (180.14% gain)\n- Test Stock (Stock): +$50 (10% gain)\n- Bitcoin (Stock) (qty 1.0000 @ buy 300.00 USD): -$19.86 (6.62% loss)\n\nThe negative performances include:\n- Bitcoin (Stock) (qty 1.0000 @ buy 100.00 USD): -$65.30 (65.3% loss)\n- New Investment (Stock) (qty 1.0000 @ buy 100.00 EUR): -$70.35 (70.35% loss)\n- Bitcoin (Stock) (qty 1.0000 @ buy 100.00 USD) has the highest loss percentage.\n\nIt\'s essential to consider your overall financial goals and risk tolerance when evaluating your portfolio\'s performance. You may want to reassess your investment strategy and consider diversifying your portfolio to minimize risk. I can help you explore options for optimizing your investments if you\'d like.', '2026-05-03 10:06:59'),
(17, 6, 'user', 'i want to know what to wear today.', '2026-05-03 10:07:17'),
(18, 6, 'ai', 'I\'m happy to help, but I\'m a financial advisor, and I don\'t have information about the weather or your personal style. I can provide guidance on managing your finances, investments, and achieving your financial goals. If you\'d like to discuss something related to your finances, I\'m here to help. Otherwise, you might want to check a weather app or ask a friend for fashion advice on what to wear today.', '2026-05-03 10:07:17'),
(19, 7, 'user', 'How is my portfolio performing overall?', '2026-05-04 03:16:09'),
(20, 7, 'ai', 'Based on your investment data, here\'s a summary of your portfolio\'s performance:\n\n* You have a mix of stocks and real estate investments.\n* Your stocks have a total loss of -155.97 (calculated from the individual losses: -65.29, -70.34, -19.84, and gains: +540.48, +50).\n* However, your real estate investment (Apartement) has a significant gain of +$5,000.\n* Considering all investments, your overall portfolio gain is approximately +$4,394.17 (combining the losses and gains).\n\nPlease note that this is a general overview and doesn\'t take into account other factors that might affect your portfolio\'s performance, such as fees, taxes, or market trends. It\'s essential to regularly review and adjust your investment strategy to ensure it aligns with your financial goals.\n\nWould you like me to suggest ways to optimize your portfolio or discuss any specific investment concerns you may have?', '2026-05-04 03:16:11'),
(21, 8, 'user', 'How is my portfolio performing overall?', '2026-05-04 03:16:45'),
(22, 8, 'ai', 'Since we haven\'t discussed your specific portfolio details, I can provide general guidance. To assess your portfolio\'s performance, consider factors such as your investment goals, risk tolerance, and time horizon. \n\nIt\'s essential to regularly review your portfolio to ensure it remains aligned with your objectives. You may want to evaluate your asset allocation, diversification, and overall returns. If you\'re unsure about your portfolio\'s performance or would like guidance on how to evaluate it, I can offer general advice and tips. Would you like to discuss your investment goals or risk tolerance to get a better understanding of how to assess your portfolio?', '2026-05-04 03:16:46'),
(23, 8, 'user', 'do you have my data?', '2026-05-04 03:17:09'),
(24, 8, 'ai', 'No, I don\'t have access to your personal financial data. You\'ve chosen not to share that information with me, and I respect your decision. Our conversation will focus on providing general financial guidance and advice. If you\'re willing to share specific details about your portfolio or financial situation, I can offer more tailored guidance. However, it\'s entirely up to you to decide what information you\'d like to share.', '2026-05-04 03:17:10'),
(25, 9, 'user', 'How is my portfolio performing overall?', '2026-05-05 11:37:05'),
(26, 9, 'ai', 'I\'d love to help you with that. However, since we didn\'t discuss what investments you have, I don\'t have any information about your portfolio (that\'s just a fancy word for a collection of investments). \n\nIf you\'d like to share what you\'ve invested in, I can try to help you understand how it\'s doing. Or we can start with the basics and talk about what kinds of investments are out there, like savings accounts, stocks (which are like tiny pieces of companies), or bonds (which are like loans to companies or governments). What sounds good to you?', '2026-05-05 11:37:06');

-- --------------------------------------------------------

--
-- Table structure for table `ChatSessions`
--

CREATE TABLE `ChatSessions` (
  `chat_session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ended_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ChatSessions`
--

INSERT INTO `ChatSessions` (`chat_session_id`, `user_id`, `started_at`, `ended_at`) VALUES
(1, 7, '2026-04-29 15:37:38', '2026-04-29 15:39:33'),
(2, 7, '2026-04-29 15:39:33', '2026-04-29 16:42:04'),
(3, 7, '2026-04-29 16:42:04', '2026-04-30 02:28:41'),
(4, 7, '2026-04-30 02:28:42', '2026-04-30 05:36:48'),
(5, 7, '2026-04-30 05:36:48', '2026-05-03 10:06:54'),
(6, 7, '2026-05-03 10:06:54', '2026-05-04 03:16:07'),
(7, 7, '2026-05-04 03:16:07', '2026-05-04 03:16:43'),
(8, 7, '2026-05-04 03:16:43', '2026-05-05 03:38:12'),
(9, 7, '2026-05-05 03:38:12', '0000-00-00 00:00:00');

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

--
-- Dumping data for table `Consultants`
--

INSERT INTO `Consultants` (`consultant_id`, `first_name`, `last_name`, `email`, `phone`, `specialization`, `rating`) VALUES
(1, 'Michel', 'Aoun', 'michel@finhub.com', '70111222', 'Investment', 4.5),
(2, 'Lara', 'Khoury', 'lara@finhub.com', '71222333', 'Debt Management', 4.5),
(3, 'Karim', 'Saad', 'karim@finhub.com', '72333444', 'Savings', 3.7),
(4, 'Zahraa', 'Zahraman', 'zahraazahraman17@gmail.com', '81365013', 'Savings', 4.3);

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

--
-- Dumping data for table `Currencies`
--

INSERT INTO `Currencies` (`currency_id`, `code`, `name`, `symbol`) VALUES
(1, 'USD', 'US Dollar', '$'),
(2, 'EUR', 'Euro', '€'),
(3, 'GBP', 'British Pound', '£'),
(4, 'LBP', 'Lebanese Pound', 'LL'),
(5, 'SAR', 'Saudi Riyal', '﷼'),
(6, 'AED', 'UAE Dirham', 'د.إ'),
(7, 'TRY', 'Turkish Lira', '₺'),
(8, 'CAD', 'Canadian Dollar', 'CA$'),
(9, 'AUD', 'Australian Dollar', 'A$'),
(10, 'CHF', 'Swiss Franc', 'CHF'),
(11, 'JPY', 'Japanese Yen', '¥'),
(12, 'EGP', 'Egyptian Pound', 'E£');

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

--
-- Dumping data for table `EmailLogs`
--

INSERT INTO `EmailLogs` (`email_id`, `user_id`, `email_type`, `sent_at`, `status`) VALUES
(1, 7, 'weekly_summary', '2026-05-01 10:09:09', 'sent'),
(2, 7, 'reminder', '2026-05-03 09:24:33', 'sent'),
(3, 7, 'reminder', '2026-05-05 11:22:34', 'sent');

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
  `transaction_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `original_amount` decimal(15,2) DEFAULT NULL,
  `original_currency_code` varchar(10) DEFAULT NULL,
  `exchange_rate` decimal(15,6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `GoalContributions`
--

INSERT INTO `GoalContributions` (`contribution_id`, `goal_id`, `account_id`, `amount`, `contribution_date`, `description`, `transaction_id`, `created_at`, `original_amount`, `original_currency_code`, `exchange_rate`) VALUES
(2, 2, 2, 200.00, '2026-04-16', NULL, NULL, '2026-04-16 07:39:21', NULL, NULL, NULL),
(5, 3, 4, 23.56, '2026-04-17', NULL, NULL, '2026-04-17 04:05:59', 20.00, 'EUR', NULL),
(10, 3, 4, 117.02, '2026-05-02', NULL, 49, '2026-05-02 11:31:49', 100.00, 'EUR', NULL),
(11, 5, 2, 85.46, '2026-05-02', NULL, 50, '2026-05-02 11:32:49', 100.00, 'USD', NULL),
(12, 5, 4, 114.54, '2026-05-02', NULL, 51, '2026-05-02 12:25:08', NULL, NULL, NULL);

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `currency_id` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Goals`
--

INSERT INTO `Goals` (`goal_id`, `user_id`, `goal_name`, `goal_type`, `target_amount`, `current_amount`, `deadline`, `created_at`, `currency_id`) VALUES
(2, 7, 'Phone', 'debt_repayment', 1000.00, 200.00, NULL, '2026-04-13 01:36:21', 1),
(3, 7, 'Surgery', 'saving', 1000.00, 140.58, '2026-08-31', '2026-04-16 07:36:16', 1),
(5, 7, 'new goal', 'saving', 200.00, 200.00, '2026-05-31', '2026-05-02 11:32:36', 2);

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

--
-- Dumping data for table `Investments`
--

INSERT INTO `Investments` (`investment_id`, `user_id`, `investment_name`, `symbol`, `investment_type`, `quantity`, `purchase_price`, `current_price`, `currency_id`, `purchase_date`, `notes`, `created_at`) VALUES
(2, 7, 'Test Stock', 'TST', 'stock', 10.0000, 50.00, 55.00, 1, '2025-01-15', 'Test investment', '2026-04-27 15:15:12'),
(3, 7, 'New Investment', 'AAPL', 'stock', 3.0000, 100.00, 276.83, 1, '2026-04-24', NULL, '2026-04-28 04:27:31'),
(4, 7, 'Apartement', NULL, 'real_estate', 1.0000, 25000.00, 30000.00, 1, '2026-03-25', 'Location: Halba', '2026-04-28 04:31:17'),
(5, 7, 'Bitcoin', 'AAPL', 'stock', 1.0000, 300.00, 276.83, 1, '2026-04-04', NULL, '2026-04-28 04:34:22'),
(7, 7, 'New Investment', 'BTC', 'stock', 1.0000, 100.00, 30.28, 2, '2026-04-16', NULL, '2026-04-28 09:45:59'),
(8, 7, 'Bitcoin', 'BTC', 'stock', 1.0000, 100.00, 35.43, 1, '2026-04-16', NULL, '2026-04-28 09:47:41');

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

--
-- Dumping data for table `Notifications`
--

INSERT INTO `Notifications` (`notification_id`, `user_id`, `type`, `title`, `message`, `is_read`, `created_at`) VALUES
(2, 2, 'bill', 'Bill Due Soon', 'Your electricity bill is due in 3 days.', 0, '2026-03-15 12:30:01'),
(5, 7, 'goal', '🎯 Goal Completed!', 'You\'ve reached your goal \"new goal\" — great work!', 1, '2026-05-02 12:25:08'),
(6, 7, 'bill', '🔔 Bill Reminder', 'Your bill \"University\" of $850.00 is due in 1 day on May 6, 2026.', 1, '2026-05-03 09:24:33'),
(7, 7, 'bill', '🔔 Bill Reminder', 'Your bill \"tomorrow\" of E£100.00 is due in 0 days on May 5, 2026.', 0, '2026-05-05 11:22:34');

-- --------------------------------------------------------

--
-- Table structure for table `Reminders`
--

CREATE TABLE `Reminders` (
  `reminder_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `bill_id` int(11) DEFAULT NULL,
  `days_before` int(11) NOT NULL DEFAULT 3,
  `message` text DEFAULT NULL,
  `reminder_date` datetime DEFAULT NULL,
  `is_sent` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Reminders`
--

INSERT INTO `Reminders` (`reminder_id`, `user_id`, `bill_id`, `days_before`, `message`, `reminder_date`, `is_sent`) VALUES
(1, 7, 2, 3, 'Your bill \"University\" of $850.00 is due in 1 day on May 6, 2026.', '2026-05-03 00:00:00', 1),
(2, 7, 4, 1, 'Your bill \"netflix\" of $15.00 is due in 1 day on May 21, 2026.', '2026-05-20 00:00:00', 0),
(3, 7, 1, 3, 'Your bill \"Spotify\" of $2.99 is due in 3 days on May 10, 2026.', '2026-05-07 00:00:00', 0),
(5, 7, 6, 1, 'Bill reminder for tomorrow', '2026-05-04 00:00:00', 1);

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

--
-- Dumping data for table `Transactions`
--

INSERT INTO `Transactions` (`transaction_id`, `account_id`, `category_id`, `amount`, `transaction_type`, `source_type`, `receipt_image_url`, `description`, `transaction_date`, `created_at`, `updated_at`) VALUES
(4, 2, 1, 1500.00, 'income', 'manual', NULL, 'Monthly salary', '2026-01-01', '2026-04-05 14:09:46', NULL),
(5, 2, 3, 50.00, 'expense', 'manual', NULL, 'Grocery shopping', '2026-01-05', '2026-04-05 14:09:46', NULL),
(6, 2, 4, 20.00, 'expense', 'manual', NULL, 'Bus ticket', '2026-01-10', '2026-04-05 14:09:46', NULL),
(7, 2, 2, 200.00, 'income', 'manual', NULL, 'Freelance project', '2026-01-15', '2026-04-05 14:09:46', NULL),
(8, 2, 5, 30.00, 'expense', 'manual', NULL, 'Netflix', '2026-01-20', '2026-04-05 14:09:46', NULL),
(9, 2, 1, 3000.00, 'income', 'manual', NULL, 'Second salary', '2026-02-01', '2026-04-05 14:12:34', NULL),
(10, 2, 7, 120.00, 'expense', 'manual', NULL, 'New shoes', '2026-02-03', '2026-04-05 14:12:34', NULL),
(11, 2, 3, 45.00, 'expense', 'manual', NULL, 'Dinner out', '2026-02-05', '2026-04-05 14:12:34', NULL),
(12, 2, 15, 500.00, 'income', 'manual', NULL, 'Side project', '2026-02-07', '2026-04-05 14:12:34', NULL),
(13, 2, 16, 200.00, 'expense', 'manual', NULL, 'Electricity bill', '2026-02-10', '2026-04-05 14:12:34', NULL),
(14, 2, NULL, 100.00, 'transfer', 'manual', NULL, 'Moving money', '2026-02-12', '2026-04-05 14:12:34', NULL),
(15, 2, 17, 60.00, 'expense', 'manual', NULL, 'Gym', '2026-02-18', '2026-04-05 14:12:34', NULL),
(16, 2, 18, 30.00, 'expense', 'manual', NULL, 'Coffee', '2026-02-22', '2026-04-05 14:12:34', NULL),
(17, 2, 1, 3000.00, 'income', 'manual', NULL, 'Second salary', '2026-02-01', '2026-04-05 14:19:02', NULL),
(18, 2, 7, 120.00, 'expense', 'manual', NULL, 'New shoes', '2026-02-03', '2026-04-05 14:19:02', NULL),
(19, 2, 3, 45.00, 'expense', 'manual', NULL, 'Dinner out', '2026-02-05', '2026-04-05 14:19:02', NULL),
(20, 2, 15, 500.00, 'income', 'manual', NULL, 'Side project', '2026-02-07', '2026-04-05 14:19:02', NULL),
(21, 2, 16, 200.00, 'expense', 'manual', NULL, 'Electricity bill', '2026-02-10', '2026-04-05 14:19:02', NULL),
(22, 2, NULL, 100.00, 'transfer', 'manual', NULL, 'Moving money', '2026-02-12', '2026-04-05 14:19:02', NULL),
(23, 2, 17, 60.00, 'expense', 'manual', NULL, 'Gym', '2026-02-18', '2026-04-05 14:19:02', NULL),
(24, 2, 18, 30.00, 'expense', 'manual', NULL, 'Coffee', '2026-02-22', '2026-04-05 14:19:02', NULL),
(25, 2, 1, 3000.00, 'income', 'manual', NULL, 'Second salary', '2026-02-01', '2026-04-07 07:27:32', NULL),
(26, 2, 7, 120.00, 'expense', 'manual', NULL, 'New shoes', '2026-02-03', '2026-04-07 07:27:32', NULL),
(27, 2, 3, 45.00, 'expense', 'manual', NULL, 'Dinner out', '2026-02-05', '2026-04-07 07:27:32', NULL),
(28, 2, 15, 500.00, 'income', 'manual', NULL, 'Side project', '2026-02-07', '2026-04-07 07:27:32', NULL),
(29, 2, 16, 200.00, 'expense', 'manual', NULL, 'Electricity bill', '2026-02-10', '2026-04-07 07:27:32', NULL),
(30, 2, NULL, 100.00, 'transfer', 'manual', NULL, 'Moving money', '2026-02-12', '2026-04-07 07:27:32', NULL),
(31, 2, 17, 60.00, 'expense', 'manual', NULL, 'Gym', '2026-02-18', '2026-04-07 07:27:32', NULL),
(32, 2, 18, 30.00, 'expense', 'manual', NULL, 'Coffee', '2026-02-22', '2026-04-07 07:27:32', NULL),
(33, 2, NULL, 23.40, 'expense', 'manual', NULL, 'Starbucks', '2024-09-16', '2026-04-09 09:00:11', NULL),
(35, 2, 19, 100.00, 'expense', 'manual', NULL, 'Goal contribution: Phone', '2026-04-13', '2026-04-13 01:58:18', NULL),
(36, 2, 3, 23.40, 'expense', 'manual', NULL, 'Starbucks', '2022-07-25', '2026-04-16 07:23:02', NULL),
(37, 2, 19, 200.00, 'expense', 'manual', NULL, 'Goal contribution: Phone', '2026-04-16', '2026-04-16 07:39:21', NULL),
(39, 4, 2, 1000.00, 'income', 'manual', NULL, '', '2026-04-17', '2026-04-17 03:50:46', NULL),
(42, 4, 19, 20.00, 'expense', 'manual', NULL, 'Goal contribution: Surgery', '2026-04-17', '2026-04-17 04:05:59', NULL),
(44, 4, 19, 80.00, 'expense', 'manual', NULL, 'TESTING CONTRIBUTION', '2026-04-17', '2026-04-17 09:15:17', NULL),
(45, 4, 7, 20.00, 'expense', 'manual', NULL, 'THIS IS A TESTING TRANSACTION', '2026-04-17', '2026-04-17 09:31:55', NULL),
(47, 6, 2, 100.00, 'income', 'manual', NULL, '', '2026-05-02', '2026-05-02 11:15:09', NULL),
(49, 4, 19, 100.00, 'expense', 'manual', NULL, 'Goal contribution: Surgery', '2026-05-02', '2026-05-02 11:31:49', NULL),
(50, 2, 19, 100.00, 'expense', 'manual', NULL, 'Goal contribution: new goal', '2026-05-02', '2026-05-02 11:32:49', NULL),
(51, 4, 19, 114.54, 'expense', 'manual', NULL, 'Goal contribution: new goal', '2026-05-02', '2026-05-02 12:25:08', NULL);

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
  `preferred_currency_id` int(11) DEFAULT 1,
  `ai_tone` enum('simple','professional') NOT NULL DEFAULT 'professional',
  `ai_data_sharing` tinyint(1) NOT NULL DEFAULT 1,
  `weekly_summary_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `email_verified` tinyint(1) DEFAULT 0,
  `verification_code` varchar(6) DEFAULT NULL,
  `verification_code_expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires_at` datetime DEFAULT NULL,
  `timezone` varchar(64) NOT NULL DEFAULT 'UTC'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`user_id`, `first_name`, `last_name`, `email`, `password_hash`, `phone_number`, `preferred_currency_id`, `ai_tone`, `ai_data_sharing`, `weekly_summary_enabled`, `status`, `email_verified`, `verification_code`, `verification_code_expires_at`, `created_at`, `reset_token`, `reset_token_expires_at`, `timezone`) VALUES
(2, 'Ali', 'Hassan', 'ali@example.com', 'hashed', '71234567', 1, 'professional', 1, 1, 'suspended', 0, NULL, NULL, '2026-03-13 08:19:51', NULL, NULL, 'UTC'),
(3, 'Sara', 'Khalil', 'sara@example.com', 'hashed', '72345678', 1, 'professional', 1, 1, 'inactive', 0, NULL, NULL, '2026-03-13 08:19:51', NULL, NULL, 'UTC'),
(7, 'Zahraa', 'Zahraman', 'zahraazahraman@gmail.com', '$2y$10$aBaQXVSEc9xsr7RpKdjY2uQ/zT6AAlcc/CoLpzVcqnGzum25pqT5W', '81365013', 3, 'simple', 0, 1, 'active', 1, NULL, NULL, '2026-04-04 13:19:24', NULL, NULL, 'Asia/Beirut');

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
-- Dumping data for table `UserSessions`
--

INSERT INTO `UserSessions` (`session_id`, `user_id`, `session_token`, `created_at`, `expires_at`) VALUES
(2, 7, '1f6bfaad2febdec4beed0c6edcabd09791db8a360d27d1d847c45e04112cab9c', '2026-05-11 09:05:24', '2026-06-10 09:05:24');

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
-- Indexes for table `AdminNotifications`
--
ALTER TABLE `AdminNotifications`
  ADD PRIMARY KEY (`notification_id`);

--
-- Indexes for table `Admins`
--
ALTER TABLE `Admins`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `Bills`
--
ALTER TABLE `Bills`
  ADD PRIMARY KEY (`bill_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `fk_bill_payment` (`paid_transaction_id`),
  ADD KEY `fk_bills_currency` (`currency_id`);

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
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_goals_currency` (`currency_id`);

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
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_preferred_currency` (`preferred_currency_id`);

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
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `AdminNotifications`
--
ALTER TABLE `AdminNotifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `Admins`
--
ALTER TABLE `Admins`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Bills`
--
ALTER TABLE `Bills`
  MODIFY `bill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `Categories`
--
ALTER TABLE `Categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `ChatMessages`
--
ALTER TABLE `ChatMessages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `ChatSessions`
--
ALTER TABLE `ChatSessions`
  MODIFY `chat_session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `ConsultantBookings`
--
ALTER TABLE `ConsultantBookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Consultants`
--
ALTER TABLE `Consultants`
  MODIFY `consultant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `Currencies`
--
ALTER TABLE `Currencies`
  MODIFY `currency_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `EmailLogs`
--
ALTER TABLE `EmailLogs`
  MODIFY `email_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `GoalContributions`
--
ALTER TABLE `GoalContributions`
  MODIFY `contribution_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `Goals`
--
ALTER TABLE `Goals`
  MODIFY `goal_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `Insights`
--
ALTER TABLE `Insights`
  MODIFY `insight_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Investments`
--
ALTER TABLE `Investments`
  MODIFY `investment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `Notifications`
--
ALTER TABLE `Notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `Reminders`
--
ALTER TABLE `Reminders`
  MODIFY `reminder_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `Transactions`
--
ALTER TABLE `Transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `UserSessions`
--
ALTER TABLE `UserSessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  ADD CONSTRAINT `fk_bill_payment` FOREIGN KEY (`paid_transaction_id`) REFERENCES `Transactions` (`transaction_id`),
  ADD CONSTRAINT `fk_bills_currency` FOREIGN KEY (`currency_id`) REFERENCES `Currencies` (`currency_id`);

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
  ADD CONSTRAINT `fk_goals_currency` FOREIGN KEY (`currency_id`) REFERENCES `Currencies` (`currency_id`),
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
-- Constraints for table `Users`
--
ALTER TABLE `Users`
  ADD CONSTRAINT `fk_users_preferred_currency` FOREIGN KEY (`preferred_currency_id`) REFERENCES `Currencies` (`currency_id`);

--
-- Constraints for table `UserSessions`
--
ALTER TABLE `UserSessions`
  ADD CONSTRAINT `usersessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
