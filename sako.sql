-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 14, 2025 at 10:17 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sako`
--

-- --------------------------------------------------------

--
-- Table structure for table `attempt_answer`
--

CREATE TABLE `attempt_answer` (
  `id` char(36) NOT NULL,
  `attempt_id` char(36) NOT NULL,
  `question_id` char(36) NOT NULL,
  `option_id` char(36) DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `answered_at` timestamp NULL DEFAULT NULL,
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attempt_answer`
--

INSERT INTO `attempt_answer` (`id`, `attempt_id`, `question_id`, `option_id`, `is_correct`, `answered_at`, `order_index`, `created_at`, `updated_at`) VALUES
('02010646-9431-4d73-937a-24a79817db15', '6b313113-c747-4a68-acce-1da171d56a3f', 'q-009', 'opt-034', 1, '2025-12-11 05:11:14', 5, '2025-12-11 05:11:16', '2025-12-11 05:11:16'),
('0257e92e-434f-4d41-a59b-9dc2415762f9', '6b313113-c747-4a68-acce-1da171d56a3f', 'q-008', 'opt-030', 0, '2025-12-11 05:11:14', 3, '2025-12-11 05:11:16', '2025-12-11 05:11:16'),
('19527979-cb6f-4db4-9b3c-339d93fe95f0', '451cefcb-b6f5-4144-93b7-b79a9130a760', 'q-009', 'opt-035', 0, '2025-12-11 05:16:50', 8, '2025-12-11 05:16:51', '2025-12-11 05:16:51'),
('1c95a8c8-8f4a-4d3f-9507-bb60d1993e18', '451cefcb-b6f5-4144-93b7-b79a9130a760', 'q-007', 'opt-026', 1, '2025-12-11 05:16:50', 1, '2025-12-11 05:16:51', '2025-12-11 05:16:51'),
('2bf1eafb-7fd1-4706-a380-b6dd8585aeaf', '6b313113-c747-4a68-acce-1da171d56a3f', 'q-002', 'opt-005', 0, '2025-12-11 05:11:14', 0, '2025-12-11 05:11:16', '2025-12-11 05:11:16'),
('337e65df-9c48-417c-953b-1b491859eb76', '6b313113-c747-4a68-acce-1da171d56a3f', 'q-006', 'opt-022', 0, '2025-12-11 05:11:14', 9, '2025-12-11 05:11:16', '2025-12-11 05:11:16'),
('49cd6688-776b-4e08-b86a-79c13a5c8f7d', '451cefcb-b6f5-4144-93b7-b79a9130a760', 'q-008', 'opt-030', 0, '2025-12-11 05:16:50', 4, '2025-12-11 05:16:51', '2025-12-11 05:16:51'),
('517d0a3b-1c60-4a9e-8ce7-00aff98b9631', '6b313113-c747-4a68-acce-1da171d56a3f', 'q-003', 'opt-010', 0, '2025-12-11 05:11:14', 1, '2025-12-11 05:11:16', '2025-12-11 05:11:16'),
('65abce2e-8ae5-464f-b9c8-c35c58ceeeb1', '451cefcb-b6f5-4144-93b7-b79a9130a760', 'q-005', 'opt-018', 1, '2025-12-11 05:16:50', 9, '2025-12-11 05:16:51', '2025-12-11 05:16:51'),
('7add613d-c55c-4eb8-a65a-fef3f204c7c2', '451cefcb-b6f5-4144-93b7-b79a9130a760', 'q-006', 'opt-021', 1, '2025-12-11 05:16:50', 7, '2025-12-11 05:16:51', '2025-12-11 05:16:51'),
('7ebef7e9-bf41-43da-bbb8-f8015a517530', '451cefcb-b6f5-4144-93b7-b79a9130a760', 'q-002', 'opt-005', 0, '2025-12-11 05:16:50', 0, '2025-12-11 05:16:51', '2025-12-11 05:16:51'),
('8a807726-889f-4c0d-a5ac-80f5e980b6de', '451cefcb-b6f5-4144-93b7-b79a9130a760', 'q-001', 'opt-001', 1, '2025-12-11 05:16:50', 5, '2025-12-11 05:16:51', '2025-12-11 05:16:51'),
('aceb5616-e32c-4c98-9841-e7fa711585d1', '6b313113-c747-4a68-acce-1da171d56a3f', 'q-005', 'opt-017', 0, '2025-12-11 05:11:14', 2, '2025-12-11 05:11:16', '2025-12-11 05:11:16'),
('b5e05ee7-6cd9-44ca-8d5f-ecaf0ca606a5', '451cefcb-b6f5-4144-93b7-b79a9130a760', 'q-003', 'opt-011', 1, '2025-12-11 05:16:50', 2, '2025-12-11 05:16:51', '2025-12-11 05:16:51'),
('c2d4cc40-a630-430b-a546-f720a1c9194d', '6b313113-c747-4a68-acce-1da171d56a3f', 'q-001', 'opt-003', 0, '2025-12-11 05:11:14', 4, '2025-12-11 05:11:16', '2025-12-11 05:11:16'),
('c34f9dcf-27b9-468a-a39d-f51b16b54932', '451cefcb-b6f5-4144-93b7-b79a9130a760', 'q-010', 'opt-037', 1, '2025-12-11 05:16:50', 6, '2025-12-11 05:16:51', '2025-12-11 05:16:51'),
('c7bdcaa6-d034-40bb-9436-f52ae63856b9', '451cefcb-b6f5-4144-93b7-b79a9130a760', 'q-004', 'opt-013', 0, '2025-12-11 05:16:50', 3, '2025-12-11 05:16:51', '2025-12-11 05:16:51'),
('d9596e86-6a61-44d8-a97b-501b4f75431c', '6b313113-c747-4a68-acce-1da171d56a3f', 'q-007', 'opt-026', 1, '2025-12-11 05:11:14', 6, '2025-12-11 05:11:16', '2025-12-11 05:11:16'),
('dbd3e51b-29c2-49a5-9ed6-3e6ffd157d68', '6b313113-c747-4a68-acce-1da171d56a3f', 'q-010', 'opt-038', 0, '2025-12-11 05:11:14', 7, '2025-12-11 05:11:16', '2025-12-11 05:11:16'),
('f805036a-0765-4d93-b82d-0c86b0ca4833', '6b313113-c747-4a68-acce-1da171d56a3f', 'q-004', 'opt-013', 0, '2025-12-11 05:11:14', 8, '2025-12-11 05:11:16', '2025-12-11 05:11:16');

-- --------------------------------------------------------

--
-- Table structure for table `badge`
--

CREATE TABLE `badge` (
  `id` char(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(512) DEFAULT NULL,
  `criteria_type` enum('level_100_percent','category_mastery','streak','points_total','custom') NOT NULL,
  `criteria_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`criteria_value`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `badge`
--

INSERT INTO `badge` (`id`, `name`, `description`, `image_url`, `criteria_type`, `criteria_value`, `is_active`, `created_at`, `updated_at`) VALUES
('badge-001', 'Pemula Sejarah', 'Selesaikan level pertama kategori Sejarah dengan nilai 70% atau lebih', 'https://example.com/badges/pemula-sejarah.png', 'level_100_percent', '{\"level_id\": \"level-001\", \"min_percent\": 70}', 1, '2025-12-11 04:06:17', '2025-12-11 04:06:17'),
('badge-002', 'Master Sejarah', 'Selesaikan semua level kategori Sejarah dengan nilai 100%', 'https://example.com/badges/master-sejarah.png', 'category_mastery', '{\"category_id\": \"cat-001\", \"min_percent\": 100}', 1, '2025-12-11 04:06:17', '2025-12-11 04:06:17'),
('badge-003', 'Ahli Budaya', 'Selesaikan semua level kategori Budaya & Tradisi', 'https://example.com/badges/ahli-budaya.png', 'category_mastery', '{\"category_id\": \"cat-002\", \"min_percent\": 70}', 1, '2025-12-11 04:06:17', '2025-12-11 04:06:17'),
('badge-004', 'Kolektor Poin', 'Kumpulkan total 500 poin', 'https://example.com/badges/kolektor-poin.png', 'points_total', '{\"min_points\": 500}', 1, '2025-12-11 04:06:17', '2025-12-11 04:06:17'),
('badge-005', 'Streak 7 Hari', 'Mainkan quiz selama 7 hari berturut-turut', 'https://example.com/badges/streak-7.png', 'streak', '{\"days\": 7}', 1, '2025-12-11 04:06:17', '2025-12-11 04:06:17');

-- --------------------------------------------------------

--
-- Table structure for table `collection_video`
--

CREATE TABLE `collection_video` (
  `id` char(36) NOT NULL,
  `id_collection` char(36) NOT NULL,
  `id_video` char(36) NOT NULL,
  `tanggal_ditambah` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `collection_video`
--

INSERT INTO `collection_video` (`id`, `id_collection`, `id_video`, `tanggal_ditambah`) VALUES
('6d6f3823-8b9b-4488-96fd-d206512ce913', 'daccd093-6306-4384-8050-b64e5830c38a', 'b12de690-d71c-11f0-9e0d-55795f701413', '2025-12-12 05:53:44');

--
-- Triggers `collection_video`
--
DELIMITER $$
CREATE TRIGGER `after_collection_video_delete` AFTER DELETE ON `collection_video` FOR EACH ROW BEGIN
  UPDATE `video_collection` 
  SET `jumlah_video` = GREATEST(`jumlah_video` - 1, 0)
  WHERE `id` = OLD.`id_collection`;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_collection_video_insert` AFTER INSERT ON `collection_video` FOR EACH ROW BEGIN
  UPDATE `video_collection` 
  SET `jumlah_video` = `jumlah_video` + 1 
  WHERE `id` = NEW.`id_collection`;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `favorit_video`
--

CREATE TABLE `favorit_video` (
  `id` char(36) NOT NULL,
  `id_user` char(36) NOT NULL,
  `id_video` char(36) NOT NULL,
  `tanggal_ditambah` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorit_video`
--

INSERT INTO `favorit_video` (`id`, `id_user`, `id_video`, `tanggal_ditambah`) VALUES
('b3e5bcf0-a399-4640-843d-467d7c2deed9', 'U586', 'b12de690-d71c-11f0-9e0d-55795f701413', '2025-12-12 05:52:59');

-- --------------------------------------------------------

--
-- Table structure for table `level`
--

CREATE TABLE `level` (
  `id` char(36) NOT NULL,
  `category_id` char(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `time_limit_seconds` int(11) DEFAULT NULL CHECK (`time_limit_seconds` between 10 and 3600),
  `pass_condition_type` enum('percent_correct','points','time','custom') NOT NULL,
  `pass_threshold` decimal(5,2) NOT NULL,
  `base_xp` int(11) DEFAULT 0,
  `base_points` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `max_questions` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `level`
--

INSERT INTO `level` (`id`, `category_id`, `name`, `description`, `time_limit_seconds`, `pass_condition_type`, `pass_threshold`, `base_xp`, `base_points`, `is_active`, `display_order`, `max_questions`, `created_at`, `updated_at`) VALUES
('level-001', 'cat-001', 'Asal Usul Minangkabau', 'Pelajari legenda dan asal usul nama Minangkabau', 300, 'percent_correct', 70.00, 50, 100, 1, 1, 10, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('level-002', 'cat-001', 'Kerajaan Pagaruyung', 'Mengenal sejarah Kerajaan Pagaruyung yang megah', 360, 'percent_correct', 70.00, 75, 150, 1, 2, 5, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('level-003', 'cat-001', 'Tokoh-Tokoh Bersejarah', 'Kenali tokoh-tokoh penting dalam sejarah Minangkabau', 420, 'percent_correct', 70.00, 100, 200, 1, 3, NULL, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('level-004', 'cat-002', 'Rumah Gadang', 'Arsitektur dan filosofi Rumah Gadang', 300, 'percent_correct', 70.00, 50, 100, 1, 1, 5, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('level-005', 'cat-002', 'Adat Perkawinan', 'Upacara dan tradisi perkawinan adat Minangkabau', 360, 'percent_correct', 70.00, 75, 150, 1, 2, NULL, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('level-006', 'cat-002', 'Sistem Matrilineal', 'Memahami sistem kekerabatan matrilineal', 420, 'percent_correct', 70.00, 100, 200, 1, 3, NULL, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('level-007', 'cat-003', 'Jam Gadang & Kota Tua', 'Jelajahi landmark ikonik Bukittinggi', 300, 'percent_correct', 70.00, 50, 100, 1, 1, NULL, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('level-008', 'cat-003', 'Danau Maninjau & Singkarak', 'Keindahan danau-danau di Sumatera Barat', 360, 'percent_correct', 70.00, 75, 150, 1, 2, NULL, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('level-009', 'cat-003', 'Ngarai Sianok', 'Pesona jurang dan lembah hijau', 420, 'percent_correct', 70.00, 100, 200, 1, 3, NULL, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('level-010', 'cat-004', 'Rendang & Gulai', 'Masakan khas Minangkabau yang terkenal', 300, 'percent_correct', 70.00, 50, 100, 1, 1, 5, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('level-011', 'cat-004', 'Makanan Tradisional', 'Kenali berbagai makanan tradisional Minang', 360, 'percent_correct', 70.00, 75, 150, 1, 2, NULL, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('level-012', 'cat-004', 'Seni Memasak Padang', 'Filosofi dan teknik masakan Padang', 420, 'percent_correct', 70.00, 100, 200, 1, 3, NULL, '2025-12-11 03:22:51', '2025-12-11 03:22:51');

-- --------------------------------------------------------

--
-- Table structure for table `prerequisite_level`
--

CREATE TABLE `prerequisite_level` (
  `id` char(36) NOT NULL,
  `level_id` char(36) NOT NULL,
  `required_level_id` char(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prerequisite_level`
--

INSERT INTO `prerequisite_level` (`id`, `level_id`, `required_level_id`, `created_at`) VALUES
('prereq-001', 'level-002', 'level-001', '2025-12-11 03:22:51'),
('prereq-002', 'level-003', 'level-002', '2025-12-11 03:22:51'),
('prereq-003', 'level-005', 'level-004', '2025-12-11 03:22:51'),
('prereq-004', 'level-006', 'level-005', '2025-12-11 03:22:51'),
('prereq-005', 'level-008', 'level-007', '2025-12-11 03:22:51'),
('prereq-006', 'level-009', 'level-008', '2025-12-11 03:22:51'),
('prereq-007', 'level-011', 'level-010', '2025-12-11 03:22:51'),
('prereq-008', 'level-012', 'level-011', '2025-12-11 03:22:51');

-- --------------------------------------------------------

--
-- Table structure for table `qr_code`
--

CREATE TABLE `qr_code` (
  `qr_code_id` char(36) NOT NULL,
  `tourist_place_id` char(36) NOT NULL,
  `code_value` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `qr_code`
--

INSERT INTO `qr_code` (`qr_code_id`, `tourist_place_id`, `code_value`, `is_active`, `created_at`, `updated_at`) VALUES
('QR001', 'TP001', 'SAKO-TP001-BKT', 1, '2025-11-29 15:16:28', '2025-11-29 15:16:28'),
('QR002', 'TP002', 'SAKO-TP002-SWL', 1, '2025-11-29 15:16:28', '2025-11-29 15:16:28'),
('QR003', 'TP003', 'SAKO-TP003-PDG', 1, '2025-11-29 15:16:28', '2025-11-29 15:16:28'),
('QR004', 'TP004', 'SAKO-TP004-PSS', 1, '2025-11-29 15:16:28', '2025-11-29 15:16:28');

-- --------------------------------------------------------

--
-- Table structure for table `question`
--

CREATE TABLE `question` (
  `id` char(36) NOT NULL,
  `level_id` char(36) NOT NULL,
  `text` text NOT NULL,
  `points_correct` int(11) DEFAULT 1,
  `points_wrong` int(11) DEFAULT 0,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `question`
--

INSERT INTO `question` (`id`, `level_id`, `text`, `points_correct`, `points_wrong`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
('q-001', 'level-001', 'Siapa tokoh dalam legenda asal usul nama Minangkabau?', 10, 0, 1, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-002', 'level-001', 'Apa arti kata \"Minangkabau\" menurut legenda?', 10, 0, 2, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-003', 'level-001', 'Hewan apa yang diadu dalam legenda Minangkabau?', 10, 0, 3, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-004', 'level-001', 'Dari mana asal nenek moyang orang Minangkabau menurut legenda?', 10, 0, 4, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-005', 'level-001', 'Apa filosofi utama masyarakat Minangkabau?', 10, 0, 5, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-006', 'level-001', 'Siapa yang memimpin masyarakat Minangkabau dalam sistem adat?', 10, 0, 6, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-007', 'level-001', 'Apa sebutan untuk wilayah asal Minangkabau?', 10, 0, 7, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-008', 'level-001', 'Tahun berapa kerajaan Pagaruyung didirikan (perkiraan)?', 10, 0, 8, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-009', 'level-001', 'Apa nama sungai besar di Sumatera Barat?', 10, 0, 9, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-010', 'level-001', 'Apa yang dimaksud dengan \"Alam Takambang Jadi Guru\"?', 10, 0, 10, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-011', 'level-002', 'Siapa gelar pemimpin tertinggi Kerajaan Pagaruyung?', 10, 0, 1, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-012', 'level-002', 'Di mana lokasi istana Kerajaan Pagaruyung?', 10, 0, 2, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-013', 'level-002', 'Sistem pemerintahan apa yang diterapkan di Minangkabau?', 10, 0, 3, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-014', 'level-002', 'Apa sebutan untuk dewan adat Minangkabau?', 10, 0, 4, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-015', 'level-002', 'Berapa jumlah luhak di Minangkabau?', 10, 0, 5, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-016', 'level-004', 'Apa ciri khas atap Rumah Gadang?', 10, 0, 1, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-017', 'level-004', 'Berapa jumlah ruangan tradisional dalam Rumah Gadang?', 10, 0, 2, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-018', 'level-004', 'Apa nama hiasan khas di dinding Rumah Gadang?', 10, 0, 3, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-019', 'level-004', 'Siapa yang memiliki hak waris Rumah Gadang?', 10, 0, 4, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-020', 'level-004', 'Apa filosofi bentuk atap Rumah Gadang?', 10, 0, 5, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-021', 'level-010', 'Apa bahan utama Rendang?', 10, 0, 1, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-022', 'level-010', 'Berapa lama waktu memasak Rendang tradisional?', 10, 0, 2, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-023', 'level-010', 'Apa perbedaan Rendang dan Kalio?', 10, 0, 3, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-024', 'level-010', 'Apa nama hidangan Minang yang menggunakan santan kelapa?', 10, 0, 4, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('q-025', 'level-010', 'Rendang berasal dari daerah mana di Sumatera Barat?', 10, 0, 5, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51');

-- --------------------------------------------------------

--
-- Table structure for table `question_option`
--

CREATE TABLE `question_option` (
  `id` char(36) NOT NULL,
  `question_id` char(36) NOT NULL,
  `label` varchar(4) NOT NULL,
  `text` text NOT NULL,
  `is_correct` tinyint(1) DEFAULT 0,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `question_option`
--

INSERT INTO `question_option` (`id`, `question_id`, `label`, `text`, `is_correct`, `display_order`, `created_at`, `updated_at`) VALUES
('opt-001', 'q-001', 'A', 'Cindua Mato', 1, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-002', 'q-001', 'B', 'Datuk Perpatih', 0, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-003', 'q-001', 'C', 'Datuk Katumanggungan', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-004', 'q-001', 'D', 'Rajo Babanding', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-005', 'q-002', 'A', 'Gunung yang Menang', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-006', 'q-002', 'B', 'Kerbau yang Menang', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-007', 'q-002', 'C', 'Sungai yang Menang', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-008', 'q-002', 'D', 'Kampung yang Menang', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-009', 'q-003', 'A', 'Ayam', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-010', 'q-003', 'B', 'Anjing', 0, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-011', 'q-003', 'C', 'Kerbau', 1, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-012', 'q-003', 'D', 'Kuda', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-013', 'q-004', 'A', 'Gunung Merapi', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-014', 'q-004', 'B', 'Gunung Singgalang', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-015', 'q-004', 'C', 'Gunung Sago', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-016', 'q-004', 'D', 'Gunung Marapi', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-017', 'q-005', 'A', 'Individualisme', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-018', 'q-005', 'B', 'Adat Basandi Syarak, Syarak Basandi Kitabullah', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-019', 'q-005', 'C', 'Gotong Royong', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-020', 'q-005', 'D', 'Demokrasi', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-021', 'q-006', 'A', 'Penghulu', 1, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-022', 'q-006', 'B', 'Raja', 0, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-023', 'q-006', 'C', 'Sultan', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-024', 'q-006', 'D', 'Datuk', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-025', 'q-007', 'A', 'Tanah Datar', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-026', 'q-007', 'B', 'Luhak Nan Tigo', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-027', 'q-007', 'C', 'Padang Panjang', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-028', 'q-007', 'D', 'Bukittinggi', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-029', 'q-008', 'A', 'Abad ke-14', 1, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-030', 'q-008', 'B', 'Abad ke-15', 0, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-031', 'q-008', 'C', 'Abad ke-16', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-032', 'q-008', 'D', 'Abad ke-17', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-033', 'q-009', 'A', 'Sungai Kampar', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-034', 'q-009', 'B', 'Sungai Batanghari', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-035', 'q-009', 'C', 'Sungai Indragiri', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-036', 'q-009', 'D', 'Sungai Musi', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-037', 'q-010', 'A', 'Alam adalah guru terbaik', 1, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-038', 'q-010', 'B', 'Alam adalah harta', 0, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-039', 'q-010', 'C', 'Alam adalah rumah', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-040', 'q-010', 'D', 'Alam adalah warisan', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-041', 'q-011', 'A', 'Sultan', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-042', 'q-011', 'B', 'Yang Dipertuan', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-043', 'q-011', 'C', 'Raja', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-044', 'q-011', 'D', 'Datuk', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-045', 'q-012', 'A', 'Padang', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-046', 'q-012', 'B', 'Batusangkar', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-047', 'q-012', 'C', 'Bukittinggi', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-048', 'q-012', 'D', 'Payakumbuh', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-049', 'q-013', 'A', 'Monarki', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-050', 'q-013', 'B', 'Demokrasi', 0, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-051', 'q-013', 'C', 'Demokrasi Adat', 1, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-052', 'q-013', 'D', 'Republik', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-053', 'q-014', 'A', 'KAN (Kerapatan Adat Nagari)', 1, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-054', 'q-014', 'B', 'DPR', 0, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-055', 'q-014', 'C', 'MPR', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-056', 'q-014', 'D', 'DPRD', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-057', 'q-015', 'A', '2', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-058', 'q-015', 'B', '3', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-059', 'q-015', 'C', '4', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-060', 'q-015', 'D', '5', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-061', 'q-016', 'A', 'Datar', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-062', 'q-016', 'B', 'Gonjong (tanduk kerbau)', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-063', 'q-016', 'C', 'Bulat', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-064', 'q-016', 'D', 'Piramida', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-065', 'q-017', 'A', '5', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-066', 'q-017', 'B', '7', 0, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-067', 'q-017', 'C', '9', 1, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-068', 'q-017', 'D', '11', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-069', 'q-018', 'A', 'Batik', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-070', 'q-018', 'B', 'Ukiran', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-071', 'q-018', 'C', 'Lukisan', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-072', 'q-018', 'D', 'Mosaik', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-073', 'q-019', 'A', 'Anak laki-laki', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-074', 'q-019', 'B', 'Anak perempuan', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-075', 'q-019', 'C', 'Anak tertua', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-076', 'q-019', 'D', 'Semua anak', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-077', 'q-020', 'A', 'Keindahan', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-078', 'q-020', 'B', 'Kekuatan', 0, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-079', 'q-020', 'C', 'Kejayaan dan semangat juang', 1, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-080', 'q-020', 'D', 'Kemakmuran', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-081', 'q-021', 'A', 'Ayam', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-082', 'q-021', 'B', 'Daging sapi', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-083', 'q-021', 'C', 'Ikan', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-084', 'q-021', 'D', 'Kambing', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-085', 'q-022', 'A', '2 jam', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-086', 'q-022', 'B', '4-6 jam', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-087', 'q-022', 'C', '1 jam', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-088', 'q-022', 'D', '30 menit', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-089', 'q-023', 'A', 'Bumbu berbeda', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-090', 'q-023', 'B', 'Kalio lebih berkuah', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-091', 'q-023', 'C', 'Rendang lebih pedas', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-092', 'q-023', 'D', 'Tidak ada perbedaan', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-093', 'q-024', 'A', 'Soto', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-094', 'q-024', 'B', 'Gulai', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-095', 'q-024', 'C', 'Sate', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-096', 'q-024', 'D', 'Bakso', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-097', 'q-025', 'A', 'Padang', 0, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-098', 'q-025', 'B', 'Lima Puluh Koto', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-099', 'q-025', 'C', 'Bukittinggi', 0, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('opt-100', 'q-025', 'D', 'Payakumbuh', 0, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempt`
--

CREATE TABLE `quiz_attempt` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `level_id` char(36) NOT NULL,
  `started_at` timestamp NULL DEFAULT current_timestamp(),
  `finished_at` timestamp NULL DEFAULT NULL,
  `duration_seconds` int(11) NOT NULL,
  `seed` int(11) NOT NULL,
  `total_questions` int(11) NOT NULL CHECK (`total_questions` >= 1),
  `status` enum('in_progress','submitted','expired','aborted') NOT NULL,
  `score_points` int(11) DEFAULT 0,
  `correct_count` int(11) DEFAULT 0,
  `wrong_count` int(11) DEFAULT 0,
  `unanswered_count` int(11) DEFAULT 0,
  `percent_correct` decimal(5,2) DEFAULT 0.00,
  `metadata_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata_snapshot`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_attempt`
--

INSERT INTO `quiz_attempt` (`id`, `user_id`, `level_id`, `started_at`, `finished_at`, `duration_seconds`, `seed`, `total_questions`, `status`, `score_points`, `correct_count`, `wrong_count`, `unanswered_count`, `percent_correct`, `metadata_snapshot`, `created_at`, `updated_at`) VALUES
('02125eff-289d-49a4-b1a3-c8ceb64ef684', 'U979', 'level-004', '2025-12-11 05:05:06', NULL, 300, 231063, 5, 'in_progress', 0, 0, 0, 0, 0.00, NULL, '2025-12-11 05:05:06', '2025-12-11 05:05:06'),
('42378ca1-ebe6-483e-a7a7-10c581db3917', 'U979', 'level-004', '2025-12-11 04:59:41', NULL, 300, 745267, 5, 'in_progress', 0, 0, 0, 0, 0.00, NULL, '2025-12-11 04:59:41', '2025-12-11 04:59:41'),
('451cefcb-b6f5-4144-93b7-b79a9130a760', 'U979', 'level-001', '2025-12-11 05:16:33', '2025-12-11 05:16:51', 300, 805946, 10, 'submitted', 60, 6, 4, 0, 60.00, NULL, '2025-12-11 05:16:33', '2025-12-11 05:16:51'),
('6b313113-c747-4a68-acce-1da171d56a3f', 'U979', 'level-001', '2025-12-11 05:07:40', '2025-12-11 05:11:16', 300, 308129, 10, 'submitted', 20, 2, 8, 0, 20.00, NULL, '2025-12-11 05:07:40', '2025-12-11 05:11:16');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_category`
--

CREATE TABLE `quiz_category` (
  `id` char(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_category`
--

INSERT INTO `quiz_category` (`id`, `name`, `description`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
('cat-001', 'Sejarah Minangkabau', 'Jelajahi sejarah dan asal-usul Minangkabau', 1, 1, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('cat-002', 'Budaya & Tradisi', 'Pelajari budaya dan adat istiadat Minangkabau', 1, 2, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('cat-003', 'Wisata Sumbar', 'Kenali tempat wisata di Sumatera Barat', 1, 3, '2025-12-11 03:22:51', '2025-12-11 03:22:51'),
('cat-004', 'Kuliner Khas', 'Temukan kekayaan kuliner Minangkabau', 1, 4, '2025-12-11 03:22:51', '2025-12-11 03:22:51');

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `review_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `tourist_place_id` char(36) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `review_text` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `total_likes` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `review`
--

INSERT INTO `review` (`review_id`, `user_id`, `tourist_place_id`, `rating`, `review_text`, `created_at`, `updated_at`, `total_likes`) VALUES
('RV128', 'U403', 'TP001', 4, 'baguss', '2025-12-14 08:38:41', '2025-12-14 08:38:41', 0),
('RV417', 'U893', 'TP001', 5, 'baguss bangett', '2025-12-11 19:15:09', '2025-12-14 08:38:13', 0),
('RV738', 'U979', 'TP001', 3, 'baguss, kerenn', '2025-12-10 17:07:21', '2025-12-14 08:38:15', 2),
('RV816', 'U403', 'TP003', 4, 'kerenn', '2025-12-14 06:50:45', '2025-12-14 06:50:45', 0);

--
-- Triggers `review`
--
DELIMITER $$
CREATE TRIGGER `after_review_delete_recalc_rating` AFTER DELETE ON `review` FOR EACH ROW BEGIN
    UPDATE `tourist_place`
    SET average_rating = (SELECT IFNULL(AVG(rating), 0) FROM review WHERE tourist_place_id = OLD.tourist_place_id)
    WHERE tourist_place_id = OLD.tourist_place_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_review_insert_update_rating` AFTER INSERT ON `review` FOR EACH ROW BEGIN
    UPDATE `tourist_place`
    SET average_rating = (
        SELECT IFNULL(AVG(rating), 0) 
        FROM review 
        WHERE tourist_place_id = NEW.tourist_place_id
    )
    WHERE tourist_place_id = NEW.tourist_place_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_review_update_recalc_rating` AFTER UPDATE ON `review` FOR EACH ROW BEGIN
    IF OLD.rating <> NEW.rating THEN
        UPDATE `tourist_place`
        SET average_rating = (SELECT IFNULL(AVG(rating), 0) FROM review WHERE tourist_place_id = NEW.tourist_place_id)
        WHERE tourist_place_id = NEW.tourist_place_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `review_like`
--

CREATE TABLE `review_like` (
  `review_like_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `review_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `review_like`
--

INSERT INTO `review_like` (`review_like_id`, `user_id`, `review_id`, `created_at`) VALUES
('RL136', 'U403', 'RV738', '2025-12-14 08:38:15'),
('RL457', 'U893', 'RV738', '2025-12-11 19:13:33');

--
-- Triggers `review_like`
--
DELIMITER $$
CREATE TRIGGER `after_review_like_delete` AFTER DELETE ON `review_like` FOR EACH ROW BEGIN
    UPDATE `review` 
    SET total_likes = GREATEST(total_likes - 1, 0) 
    WHERE review_id = OLD.review_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_review_like_insert` AFTER INSERT ON `review_like` FOR EACH ROW BEGIN
    UPDATE `review`
    SET total_likes = total_likes + 1
    WHERE review_id = NEW.review_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `tourist_place`
--

CREATE TABLE `tourist_place` (
  `tourist_place_id` char(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL COMMENT 'Koordinat Lintang',
  `longitude` decimal(11,8) DEFAULT NULL COMMENT 'Koordinat Bujur',
  `image_url` varchar(512) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `average_rating` decimal(3,1) DEFAULT 0.0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tourist_place`
--

INSERT INTO `tourist_place` (`tourist_place_id`, `name`, `description`, `address`, `latitude`, `longitude`, `image_url`, `is_active`, `created_at`, `updated_at`, `average_rating`) VALUES
('TP001', 'Kosan Gacorr', 'Kosan gacor adalah ikon pariwisata Kota Bukittinggi yang menjulang setinggi 26 meter di jantung kota. Menara jam ini memiliki keunikan pada angka empat romawi yang ditulis IIII dan atap bagonjong yang mencerminkan arsitektur Minangkabau. Dibangun pada masa kolonial Belanda, tempat ini menawarkan pemandangan kota yang indah dan udara sejuk khas perbukitan.', 'Pauh, Pasar Baru, Padang', -0.93262503, 100.42720410, 'https://lqdmiwpsmufcwziayoev.supabase.co/storage/v1/object/public/sako-assets/tourist-places/TP001-jam-gadang.jpg', 1, '2025-11-29 15:16:28', '2025-12-14 08:38:33', 4.0),
('TP002', 'Museum Gudang Ransum', 'Terletak di Sawahlunto, museum ini merupakan bekas dapur umum yang dibangun pada tahun 1918 untuk pekerja tambang batubara. Koleksinya meliputi periuk dan kuali raksasa yang menjadi saksi bisu sejarah pertambangan \"Orang Rantai\" di era kolonial. Wisatawan dapat mempelajari sejarah kuliner massal dan teknologi uap yang digunakan pada masa lampau.', 'Jl. Abdul Rahman Hakim, Air Dingin, Sawahlunto', -0.66985000, 100.76891000, 'https://lqdmiwpsmufcwziayoev.supabase.co/storage/v1/object/public/sako-assets/tourist-places/TP002-museum-gudang-ransum.jpg', 1, '2025-11-29 15:16:28', '2025-12-13 18:06:38', 0.0),
('TP003', 'Pantai Air Manis', 'Pantai ini terkenal di seluruh nusantara sebagai lokasi legenda Malin Kundang si anak durhaka. Pengunjung dapat melihat formasi batu yang menyerupai pecahan kapal dan sosok manusia yang sedang bersujud memohon ampun di tepi pantai. Selain wisata sejarah, pantai ini menawarkan pasir cokelat yang luas dan pemandangan Gunung Padang yang memukau.', 'Jl. Malin Kundang, Air Manis, Padang Selatan, Kota Padang', -0.99871000, 100.36370000, 'https://lqdmiwpsmufcwziayoev.supabase.co/storage/v1/object/public/sako-assets/tourist-places/TP003-pantai-air-manis.jpg', 1, '2025-11-29 15:16:28', '2025-12-14 06:50:45', 4.0),
('TP004', 'Pantai Carocok', 'Primadona wisata di Painan, Pesisir Selatan ini menawarkan keindahan air laut yang jernih dan jembatan apung yang ikonik. Terhubung dengan Pulau Batu Kereta, kawasan ini menjadi spot favorit untuk menikmati matahari terbenam dan bermain wahana air. Suasana pantai yang tenang menjadikannya lokasi yang sempurna untuk rekreasi keluarga.', 'Jl. Pantai Carocok, Painan, Pesisir Selatan', -1.34539000, 100.58867000, 'https://lqdmiwpsmufcwziayoev.supabase.co/storage/v1/object/public/sako-assets/tourist-places/TP004-pantai-carocok.jpeg', 1, '2025-11-29 15:16:28', '2025-12-13 18:06:38', 0.0);

--
-- Triggers `tourist_place`
--
DELIMITER $$
CREATE TRIGGER `after_place_create_init_visits` AFTER INSERT ON `tourist_place` FOR EACH ROW BEGIN
    INSERT INTO `user_visit` (user_visit_id, user_id, tourist_place_id, status)
    SELECT UUID(), users_id, NEW.tourist_place_id, 'not_visited'
    FROM `users`;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `users_id` char(36) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `total_xp` int(11) DEFAULT 0,
  `status` enum('active','inactive','banned') DEFAULT 'active',
  `user_image_url` varchar(512) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `token` varchar(255) DEFAULT NULL,
  `fcm_token` text DEFAULT NULL,
  `notification_preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`notification_preferences`)),
  `token_validity` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`users_id`, `full_name`, `email`, `password_hash`, `total_xp`, `status`, `user_image_url`, `created_at`, `updated_at`, `token`, `fcm_token`, `notification_preferences`, `token_validity`) VALUES
('U080', 'Ridhoooo123aa', 'ridho123@gmail.com', '$2b$10$ythHm9TW77j3cO0P2AfI0en/vzDxAkqe6XQrIMYN4Pnrw/V0olqrG', 0, 'active', NULL, '2025-12-10 10:24:56', '2025-12-10 10:25:29', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vyc19pZCI6IlUwODAiLCJlbWFpbCI6InJpZGhvMTIzQGdtYWlsLmNvbSIsImlhdCI6MTc2NTM2MjMyOSwiZXhwIjoxNzY3OTU0MzI5fQ.g1P9o_GQQjYNwwAwWUzI6HzCRLRV3bVqRfK4wnpsbrk', 'eIFfXb7TT9-PeXC7dB2DcH:APA91bHbSuC05FIsHXHhsKUmEc2PH8obnnBK_cRi618Ve_aqYzLOKdtIDftMOLwsS-JfI2TYnpSdeJPaEUuPCleb5d0SN72xpwhN1a1C5F9tl-55u64L6F8', '{\"system_announcements\":true,\"marketing\":false,\"map_notifications\":{\"review_added\":true,\"place_visited\":true}}', '2026-01-09 17:25:29'),
('U094', 'Ridhooo', 'testt@gmail.com', '$2b$10$01lRbCO08my6K1uSQeTDU.T8ekE5fmTy0ZIxH/3qsAcZAoqfilOMW', 0, 'active', NULL, '2025-12-10 10:05:38', '2025-12-10 10:06:13', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vyc19pZCI6IlUwOTQiLCJlbWFpbCI6InRlc3R0QGdtYWlsLmNvbSIsImlhdCI6MTc2NTM2MTE3MywiZXhwIjoxNzY3OTUzMTczfQ.GSZijqjCRsirbWNbJVYiTh3hx6gRHcwUrC8KKf7JIbg', 'eIFfXb7TT9-PeXC7dB2DcH:APA91bHbSuC05FIsHXHhsKUmEc2PH8obnnBK_cRi618Ve_aqYzLOKdtIDftMOLwsS-JfI2TYnpSdeJPaEUuPCleb5d0SN72xpwhN1a1C5F9tl-55u64L6F8', '{\"system_announcements\":true,\"marketing\":false,\"map_notifications\":{\"review_added\":true,\"place_visited\":true}}', '2026-01-09 17:06:13'),
('U320', 'ochaa', 'raisyaa@gmail.com', '$2b$10$tmy//VrbXyYeiCjRHW3xDenyCb0yLfUqTopEDQDOrnrm61h1Eu2yC', 0, 'active', NULL, '2025-12-10 14:44:04', '2025-12-10 14:44:53', 'T1765377893086-U320', 'd2qiDZt8QDeLvE3UMSvi98:APA91bGPM04IEtx3Xp5doMdUVMnQ_6-Vq0H-0MYIQSKZ5VgmJWE1yxQFKHgHVckH8HfaoIdVI-HsnW2VaZSPp9fr3FsM-JGJf8TqwKci2l45DAKLkBivy08', '{\"system_announcements\":true,\"marketing\":false,\"map_notifications\":{\"review_added\":true,\"place_visited\":true}}', '2026-01-09 21:44:53'),
('U403', 'Ridho Dwi Syahputra', 'ridhooo1@example.com', '$2b$10$oyTs20zxImh4UHTMB7xgBOmcMkKLdudQHni5JWvcQBnheh0vKntYm', 500, 'active', NULL, '2025-12-05 06:22:21', '2025-12-14 06:50:16', 'T1765695016015-U403', 'eXFnc96JT1O5n3U4F9VWyu:APA91bEh71TM_ML4qICTnpnxAh3ugHZeXnShpGWCXC1ij6xt4r4LDsZWxozalv3o0FH_ZRYOcJIt9i1jl2IO-6DKCOci_9WnwNLN6kDzQN7cDs87bzqEZjg', '{\"map_notifications\":{\"place_visited\":true,\"review_added\":true},\"marketing\":false,\"quiz_notifications\":true,\"system_announcements\":true,\"video_notifications\":true}', '2026-01-13 13:50:16'),
('U586', 'Dev Sako', 'sako@dev.com', '$2b$10$lg4o3qPduBra7DpjMzwcfeUo/MCncVPw1u8I0ioAAdiVn8WvdPf92', 0, 'active', NULL, '2025-12-12 05:52:09', '2025-12-12 05:56:15', 'T1765518738108-U586', 'eUHF4dshRAeVLPvC4H7ubH:APA91bFITiULngRTDhCLhBap2EbK_WbhBC3pATOyA3drlgRAtSyepDgMtWvblXJJs33rYnWD5OWd7i40n_WnNqpsSXv4jdvRGO9HV9k0Mv7jtmmWCb2mgm0', '{\"map_notifications\":{\"place_visited\":true,\"review_added\":true},\"marketing\":false,\"quiz_notifications\":true,\"system_announcements\":true,\"video_notifications\":true}', '2026-01-11 12:52:18'),
('U621', 'Ridhoooooooooooo', 'testing123455@gmail.com', '$2b$10$yWn/MZhT035NgrRnAh2W5O6190cCcZclLdfccxWbcpB2PQ05zVBDm', 0, 'active', NULL, '2025-12-10 10:31:03', '2025-12-10 10:38:53', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vyc19pZCI6IlU2MjEiLCJpYXQiOjE3NjUzNjMxMzMsImV4cCI6MTc2NTM2NjczM30.gKDfte-Q3AzUQBjZBDM8-o8RFmnZlGwvYwNGKU2CwK4', 'eIFfXb7TT9-PeXC7dB2DcH:APA91bHbSuC05FIsHXHhsKUmEc2PH8obnnBK_cRi618Ve_aqYzLOKdtIDftMOLwsS-JfI2TYnpSdeJPaEUuPCleb5d0SN72xpwhN1a1C5F9tl-55u64L6F8', '{\"system_announcements\":true,\"marketing\":false,\"map_notifications\":{\"review_added\":true,\"place_visited\":true}}', '2026-01-09 17:38:53'),
('U662', 'Ridho Dwi Syahputra', 'ridhooo@example.com', '$2b$10$Hl62xlT5R2Ws.Dxd/bnXNea5W6S1g9nv0I3hVZugQvTZxAhUiWg/u', 50, 'active', NULL, '2025-12-05 06:18:49', '2025-12-13 17:12:13', NULL, 'fYItkDNzTba0eimnjGpYc9:APA91bHNsAl8oVU1l1Kfb1q0ejsD5U4TdRdt6RSB5nCze5Ksp2frwotPOn-UTIfwFD5HPSTAfC-tRX-Y6ppTugGHlsIcE2e4d6oTZBatiD5_WAomgPDTZys', '{\"system_announcements\":true,\"marketing\":false,\"map_notifications\":{\"review_added\":true,\"place_visited\":true}}', '2025-12-05 13:18:49'),
('U666', 'Raisyaaa', 'akuncontoh@gmail.com', '$2b$10$4izkKrJ606W1lNf3viNlHupX0BWxQvKziGn6bRpIPn6wf9ixYBkBu', 0, 'active', NULL, '2025-12-10 14:59:57', '2025-12-10 15:00:37', 'T1765378837550-U666', 'cEBzBETySMG4KZZWjPzOh0:APA91bGU6mTh_kygMMtM2EWz2riqYnyFkFrpsMkTUtryIhZu5TqCHrW7FwGhv_sPqO7BDVKblzW7Y7vDJXBf0neeZPjgQimMUinVwUPAUPj4n8UNRMMbQ_E', '{\"system_announcements\":true,\"marketing\":false,\"map_notifications\":{\"review_added\":true,\"place_visited\":true}}', '2026-01-09 22:00:37'),
('U893', 'Ridho Dwiii', 'test123@gmail.com', '$2b$10$pcb1hjtxv9DHoCFqTcARceDZR9h1a4k9BUrpaBTNbMrbzb0SHUpIi', 0, 'active', NULL, '2025-12-10 10:16:42', '2025-12-11 19:24:27', NULL, NULL, '{\"map_notifications\":{\"place_visited\":true,\"review_added\":true},\"marketing\":false,\"quiz_notifications\":true,\"system_announcements\":true,\"video_notifications\":true}', NULL),
('U979', 'OCHAAA', '1234@gmail.com', '$2b$10$cMmwKuxfsijv3SlXk8U9T.izLKr3lgWNSxmoYuqxlv6nbmNA4Rs.C', 0, 'active', NULL, '2025-12-10 15:11:29', '2025-12-11 18:54:32', NULL, NULL, '{\"map_notifications\":{\"place_visited\":true,\"review_added\":true},\"marketing\":false,\"quiz_notifications\":true,\"system_announcements\":true,\"video_notifications\":true}', NULL);

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `after_user_register_init_visits` AFTER INSERT ON `users` FOR EACH ROW BEGIN
    INSERT INTO `user_visit` (user_visit_id, user_id, tourist_place_id, status)
    SELECT UUID(), NEW.users_id, tourist_place_id, 'not_visited'
    FROM `tourist_place`;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `user_badge`
--

CREATE TABLE `user_badge` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `badge_id` char(36) NOT NULL,
  `earned_at` timestamp NULL DEFAULT current_timestamp(),
  `source_level_id` char(36) DEFAULT NULL,
  `source_category_id` char(36) DEFAULT NULL,
  `attempt_id` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_category_progress`
--

CREATE TABLE `user_category_progress` (
  `user_id` char(36) NOT NULL,
  `category_id` char(36) NOT NULL,
  `percent_completed` decimal(5,2) DEFAULT 0.00,
  `completed_levels_count` int(11) DEFAULT 0,
  `total_levels_count` int(11) DEFAULT 0,
  `last_updated_at` timestamp NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_level_progress`
--

CREATE TABLE `user_level_progress` (
  `user_id` char(36) NOT NULL,
  `level_id` char(36) NOT NULL,
  `best_percent_correct` decimal(5,2) DEFAULT 0.00,
  `best_score_points` int(11) DEFAULT 0,
  `total_attempts` int(11) DEFAULT 0,
  `status` enum('locked','unstarted','in_progress','completed') DEFAULT 'locked',
  `last_attempt_id` char(36) DEFAULT NULL,
  `last_updated_at` timestamp NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_level_progress`
--

INSERT INTO `user_level_progress` (`user_id`, `level_id`, `best_percent_correct`, `best_score_points`, `total_attempts`, `status`, `last_attempt_id`, `last_updated_at`, `created_at`) VALUES
('U979', 'level-001', 60.00, 60, 2, 'in_progress', '451cefcb-b6f5-4144-93b7-b79a9130a760', '2025-12-11 05:16:51', '2025-12-11 05:07:40'),
('U979', 'level-004', 0.00, 0, 2, 'in_progress', NULL, '2025-12-11 05:05:06', '2025-12-11 04:59:41');

-- --------------------------------------------------------

--
-- Table structure for table `user_points`
--

CREATE TABLE `user_points` (
  `user_id` char(36) NOT NULL,
  `total_points` int(11) DEFAULT 0,
  `lifetime_points` int(11) DEFAULT 0,
  `last_updated_at` timestamp NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_visit`
--

CREATE TABLE `user_visit` (
  `user_visit_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `tourist_place_id` char(36) NOT NULL,
  `status` enum('visited','not_visited') DEFAULT 'not_visited',
  `visited_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_visit`
--

INSERT INTO `user_visit` (`user_visit_id`, `user_id`, `tourist_place_id`, `status`, `visited_at`, `created_at`, `updated_at`) VALUES
('43ae0602-d1a2-11f0-9bc6-4f5ce35c2399', 'U662', 'TP001', 'not_visited', NULL, '2025-12-05 06:18:49', '2025-12-05 06:18:49'),
('43ae426c-d1a2-11f0-9bc6-4f5ce35c2399', 'U662', 'TP002', 'visited', NULL, '2025-12-05 06:18:49', '2025-12-05 09:13:11'),
('43ae4429-d1a2-11f0-9bc6-4f5ce35c2399', 'U662', 'TP003', 'not_visited', NULL, '2025-12-05 06:18:49', '2025-12-05 06:18:49'),
('43ae4664-d1a2-11f0-9bc6-4f5ce35c2399', 'U662', 'TP004', 'not_visited', NULL, '2025-12-05 06:18:49', '2025-12-05 06:18:49'),
('529d98bd-d5b1-11f0-a028-e8fb1ca180ac', 'U893', 'TP001', 'not_visited', NULL, '2025-12-10 10:16:42', '2025-12-10 10:16:42'),
('529dba71-d5b1-11f0-a028-e8fb1ca180ac', 'U893', 'TP002', 'not_visited', NULL, '2025-12-10 10:16:42', '2025-12-10 10:16:42'),
('529dbb9b-d5b1-11f0-a028-e8fb1ca180ac', 'U893', 'TP003', 'not_visited', NULL, '2025-12-10 10:16:42', '2025-12-10 10:16:42'),
('529dbd27-d5b1-11f0-a028-e8fb1ca180ac', 'U893', 'TP004', 'not_visited', NULL, '2025-12-10 10:16:42', '2025-12-10 10:16:42'),
('543e77ce-d5b3-11f0-a028-e8fb1ca180ac', 'U621', 'TP001', 'not_visited', NULL, '2025-12-10 10:31:03', '2025-12-10 10:31:03'),
('543e7a4b-d5b3-11f0-a028-e8fb1ca180ac', 'U621', 'TP002', 'not_visited', NULL, '2025-12-10 10:31:03', '2025-12-10 10:31:03'),
('543e7b69-d5b3-11f0-a028-e8fb1ca180ac', 'U621', 'TP003', 'not_visited', NULL, '2025-12-10 10:31:03', '2025-12-10 10:31:03'),
('543e7c59-d5b3-11f0-a028-e8fb1ca180ac', 'U621', 'TP004', 'not_visited', NULL, '2025-12-10 10:31:03', '2025-12-10 10:31:03'),
('793016ab-d5b2-11f0-a028-e8fb1ca180ac', 'U080', 'TP001', 'not_visited', NULL, '2025-12-10 10:24:56', '2025-12-10 10:24:56'),
('7930186a-d5b2-11f0-a028-e8fb1ca180ac', 'U080', 'TP002', 'not_visited', NULL, '2025-12-10 10:24:56', '2025-12-10 10:24:56'),
('7930192b-d5b2-11f0-a028-e8fb1ca180ac', 'U080', 'TP003', 'not_visited', NULL, '2025-12-10 10:24:56', '2025-12-10 10:24:56'),
('79301a34-d5b2-11f0-a028-e8fb1ca180ac', 'U080', 'TP004', 'not_visited', NULL, '2025-12-10 10:24:56', '2025-12-10 10:24:56'),
('80f71a4f-d5da-11f0-a028-e8fb1ca180ac', 'U979', 'TP001', 'not_visited', NULL, '2025-12-10 15:11:29', '2025-12-10 15:11:29'),
('80f7f4a5-d5da-11f0-a028-e8fb1ca180ac', 'U979', 'TP002', 'not_visited', NULL, '2025-12-10 15:11:29', '2025-12-10 15:11:29'),
('80f8b508-d5da-11f0-a028-e8fb1ca180ac', 'U979', 'TP003', 'not_visited', NULL, '2025-12-10 15:11:29', '2025-12-10 15:11:29'),
('80f8b9c3-d5da-11f0-a028-e8fb1ca180ac', 'U979', 'TP004', 'not_visited', NULL, '2025-12-10 15:11:29', '2025-12-10 15:11:29'),
('acb155bc-d5d6-11f0-a028-e8fb1ca180ac', 'U320', 'TP001', 'not_visited', NULL, '2025-12-10 14:44:04', '2025-12-10 14:44:04'),
('acb2e88e-d5d6-11f0-a028-e8fb1ca180ac', 'U320', 'TP002', 'not_visited', NULL, '2025-12-10 14:44:04', '2025-12-10 14:44:04'),
('acb2eb96-d5d6-11f0-a028-e8fb1ca180ac', 'U320', 'TP003', 'not_visited', NULL, '2025-12-10 14:44:04', '2025-12-10 14:44:04'),
('acb2ed4b-d5d6-11f0-a028-e8fb1ca180ac', 'U320', 'TP004', 'not_visited', NULL, '2025-12-10 14:44:04', '2025-12-10 14:44:04'),
('b2d7201b-d71e-11f0-9e0d-55795f701413', 'U586', 'TP001', 'not_visited', NULL, '2025-12-12 05:52:09', '2025-12-12 05:52:09'),
('b2d7aab9-d71e-11f0-9e0d-55795f701413', 'U586', 'TP002', 'not_visited', NULL, '2025-12-12 05:52:09', '2025-12-12 05:52:09'),
('b2d7ab7e-d71e-11f0-9e0d-55795f701413', 'U586', 'TP003', 'not_visited', NULL, '2025-12-12 05:52:09', '2025-12-12 05:52:09'),
('b2d7abec-d71e-11f0-9e0d-55795f701413', 'U586', 'TP004', 'not_visited', NULL, '2025-12-12 05:52:09', '2025-12-12 05:52:09'),
('c1d98262-d1a2-11f0-9bc6-4f5ce35c2399', 'U403', 'TP001', 'visited', '2025-12-14 05:52:44', '2025-12-05 06:22:21', '2025-12-14 05:52:44'),
('c1d984dc-d1a2-11f0-9bc6-4f5ce35c2399', 'U403', 'TP002', 'visited', NULL, '2025-12-05 06:22:21', '2025-12-05 09:13:02'),
('c1d98600-d1a2-11f0-9bc6-4f5ce35c2399', 'U403', 'TP003', 'not_visited', NULL, '2025-12-05 06:22:21', '2025-12-05 06:22:21'),
('c1d98722-d1a2-11f0-9bc6-4f5ce35c2399', 'U403', 'TP004', 'not_visited', NULL, '2025-12-05 06:22:21', '2025-12-05 06:22:21'),
('c6faaee8-d5af-11f0-a028-e8fb1ca180ac', 'U094', 'TP001', 'not_visited', NULL, '2025-12-10 10:05:38', '2025-12-10 10:05:38'),
('c6fac69c-d5af-11f0-a028-e8fb1ca180ac', 'U094', 'TP002', 'not_visited', NULL, '2025-12-10 10:05:38', '2025-12-10 10:05:38'),
('c6fac79f-d5af-11f0-a028-e8fb1ca180ac', 'U094', 'TP003', 'not_visited', NULL, '2025-12-10 10:05:38', '2025-12-10 10:05:38'),
('c6fac8a5-d5af-11f0-a028-e8fb1ca180ac', 'U094', 'TP004', 'not_visited', NULL, '2025-12-10 10:05:38', '2025-12-10 10:05:38'),
('e4eeb996-d5d8-11f0-a028-e8fb1ca180ac', 'U666', 'TP001', 'not_visited', NULL, '2025-12-10 14:59:57', '2025-12-10 14:59:57'),
('e4eedc6c-d5d8-11f0-a028-e8fb1ca180ac', 'U666', 'TP002', 'not_visited', NULL, '2025-12-10 14:59:57', '2025-12-10 14:59:57'),
('e4eedf38-d5d8-11f0-a028-e8fb1ca180ac', 'U666', 'TP003', 'not_visited', NULL, '2025-12-10 14:59:57', '2025-12-10 14:59:57'),
('e4eee85c-d5d8-11f0-a028-e8fb1ca180ac', 'U666', 'TP004', 'not_visited', NULL, '2025-12-10 14:59:57', '2025-12-10 14:59:57');

-- --------------------------------------------------------

--
-- Table structure for table `video`
--

CREATE TABLE `video` (
  `id` char(36) NOT NULL,
  `judul` varchar(150) NOT NULL,
  `kategori` enum('Kesenian','Kuliner','Adat','Wisata') NOT NULL,
  `youtube_url` varchar(512) NOT NULL,
  `thumbnail_url` varchar(512) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `video`
--

INSERT INTO `video` (`id`, `judul`, `kategori`, `youtube_url`, `thumbnail_url`, `deskripsi`, `is_active`, `created_at`, `updated_at`) VALUES
('678538ca-d71c-11f0-9e0d-55795f701413', 'Pariwisata Minangkabau', 'Wisata', 'https://youtu.be/eBz5bQ9j2o8?si=L48KfKtRisH9LC14', NULL, 'Video dari DinPar Prov Sumatera Barat', 1, '2025-12-12 05:35:44', '2025-12-12 05:35:44'),
('845748f9-d71c-11f0-9e0d-55795f701413', 'Pesona Sumatera Barat', 'Kesenian', 'https://youtu.be/QppWT8UpR0A?si=HX-Q1YsYgq4I4ln6', NULL, 'Video dari Kementrian Pariwisata', 1, '2025-12-12 05:36:32', '2025-12-12 05:36:32'),
('9cfc73d6-d71c-11f0-9e0d-55795f701413', 'Desa Wisata SUMBAR', 'Wisata', 'https://youtu.be/ejnH-LTKBEE?si=sSXD22wTDpH5JnQH', NULL, 'Video dari NatGeo', 1, '2025-12-12 05:37:14', '2025-12-12 05:37:14'),
('b12de690-d71c-11f0-9e0d-55795f701413', 'Kuliner Rendang Minang', 'Kuliner', 'https://youtu.be/idKkTKhZn7c?si=rnU1lEiLFUXmtIT3', NULL, '-', 1, '2025-12-12 05:37:48', '2025-12-12 05:37:48');

-- --------------------------------------------------------

--
-- Table structure for table `video_collection`
--

CREATE TABLE `video_collection` (
  `id` char(36) NOT NULL,
  `id_user` char(36) NOT NULL,
  `nama_koleksi` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL COMMENT 'Optional: URL to collection cover image',
  `jumlah_video` int(11) DEFAULT 0 COMMENT 'Cached count of videos in collection',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `video_collection`
--

INSERT INTO `video_collection` (`id`, `id_user`, `nama_koleksi`, `deskripsi`, `thumbnail_url`, `jumlah_video`, `created_at`, `updated_at`) VALUES
('daccd093-6306-4384-8050-b64e5830c38a', 'U586', 'Kota Padang', 'Tentang Segala Kebudayaan Kota Padang', NULL, 1, '2025-12-12 05:53:42', '2025-12-12 05:53:44');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attempt_answer`
--
ALTER TABLE `attempt_answer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attempt_id` (`attempt_id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `option_id` (`option_id`);

--
-- Indexes for table `badge`
--
ALTER TABLE `badge`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `collection_video`
--
ALTER TABLE `collection_video`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_collection_video` (`id_collection`,`id_video`),
  ADD KEY `idx_collection` (`id_collection`),
  ADD KEY `idx_video` (`id_video`);

--
-- Indexes for table `favorit_video`
--
ALTER TABLE `favorit_video`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_user` (`id_user`,`id_video`),
  ADD KEY `id_video` (`id_video`);

--
-- Indexes for table `level`
--
ALTER TABLE `level`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `prerequisite_level`
--
ALTER TABLE `prerequisite_level`
  ADD PRIMARY KEY (`id`),
  ADD KEY `level_id` (`level_id`),
  ADD KEY `required_level_id` (`required_level_id`);

--
-- Indexes for table `qr_code`
--
ALTER TABLE `qr_code`
  ADD PRIMARY KEY (`qr_code_id`),
  ADD UNIQUE KEY `code_value` (`code_value`),
  ADD KEY `tourist_place_id` (`tourist_place_id`);

--
-- Indexes for table `question`
--
ALTER TABLE `question`
  ADD PRIMARY KEY (`id`),
  ADD KEY `level_id` (`level_id`);

--
-- Indexes for table `question_option`
--
ALTER TABLE `question_option`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`);

--
-- Indexes for table `quiz_attempt`
--
ALTER TABLE `quiz_attempt`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `level_id` (`level_id`);

--
-- Indexes for table `quiz_category`
--
ALTER TABLE `quiz_category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `tourist_place_id` (`tourist_place_id`);

--
-- Indexes for table `review_like`
--
ALTER TABLE `review_like`
  ADD PRIMARY KEY (`review_like_id`),
  ADD UNIQUE KEY `unique_user_review_like` (`user_id`,`review_id`),
  ADD KEY `review_id` (`review_id`);

--
-- Indexes for table `tourist_place`
--
ALTER TABLE `tourist_place`
  ADD PRIMARY KEY (`tourist_place_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`users_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_users_status` (`status`);

--
-- Indexes for table `user_badge`
--
ALTER TABLE `user_badge`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `badge_id` (`badge_id`),
  ADD KEY `source_level_id` (`source_level_id`),
  ADD KEY `source_category_id` (`source_category_id`),
  ADD KEY `attempt_id` (`attempt_id`);

--
-- Indexes for table `user_category_progress`
--
ALTER TABLE `user_category_progress`
  ADD PRIMARY KEY (`user_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `user_level_progress`
--
ALTER TABLE `user_level_progress`
  ADD PRIMARY KEY (`user_id`,`level_id`),
  ADD KEY `level_id` (`level_id`),
  ADD KEY `last_attempt_id` (`last_attempt_id`);

--
-- Indexes for table `user_points`
--
ALTER TABLE `user_points`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_visit`
--
ALTER TABLE `user_visit`
  ADD PRIMARY KEY (`user_visit_id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`tourist_place_id`),
  ADD KEY `tourist_place_id` (`tourist_place_id`);

--
-- Indexes for table `video`
--
ALTER TABLE `video`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `video_collection`
--
ALTER TABLE `video_collection`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_collection` (`id_user`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attempt_answer`
--
ALTER TABLE `attempt_answer`
  ADD CONSTRAINT `attempt_answer_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempt` (`id`),
  ADD CONSTRAINT `attempt_answer_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`),
  ADD CONSTRAINT `attempt_answer_ibfk_3` FOREIGN KEY (`option_id`) REFERENCES `question_option` (`id`);

--
-- Constraints for table `collection_video`
--
ALTER TABLE `collection_video`
  ADD CONSTRAINT `fk_cv_collection` FOREIGN KEY (`id_collection`) REFERENCES `video_collection` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cv_video` FOREIGN KEY (`id_video`) REFERENCES `video` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `favorit_video`
--
ALTER TABLE `favorit_video`
  ADD CONSTRAINT `favorit_video_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`users_id`),
  ADD CONSTRAINT `favorit_video_ibfk_2` FOREIGN KEY (`id_video`) REFERENCES `video` (`id`);

--
-- Constraints for table `level`
--
ALTER TABLE `level`
  ADD CONSTRAINT `level_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `quiz_category` (`id`);

--
-- Constraints for table `prerequisite_level`
--
ALTER TABLE `prerequisite_level`
  ADD CONSTRAINT `prerequisite_level_ibfk_1` FOREIGN KEY (`level_id`) REFERENCES `level` (`id`),
  ADD CONSTRAINT `prerequisite_level_ibfk_2` FOREIGN KEY (`required_level_id`) REFERENCES `level` (`id`);

--
-- Constraints for table `qr_code`
--
ALTER TABLE `qr_code`
  ADD CONSTRAINT `qr_code_ibfk_1` FOREIGN KEY (`tourist_place_id`) REFERENCES `tourist_place` (`tourist_place_id`);

--
-- Constraints for table `question`
--
ALTER TABLE `question`
  ADD CONSTRAINT `question_ibfk_1` FOREIGN KEY (`level_id`) REFERENCES `level` (`id`);

--
-- Constraints for table `question_option`
--
ALTER TABLE `question_option`
  ADD CONSTRAINT `question_option_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`);

--
-- Constraints for table `quiz_attempt`
--
ALTER TABLE `quiz_attempt`
  ADD CONSTRAINT `quiz_attempt_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`users_id`),
  ADD CONSTRAINT `quiz_attempt_ibfk_2` FOREIGN KEY (`level_id`) REFERENCES `level` (`id`);

--
-- Constraints for table `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `review_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`users_id`),
  ADD CONSTRAINT `review_ibfk_2` FOREIGN KEY (`tourist_place_id`) REFERENCES `tourist_place` (`tourist_place_id`);

--
-- Constraints for table `review_like`
--
ALTER TABLE `review_like`
  ADD CONSTRAINT `review_like_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`users_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_like_ibfk_2` FOREIGN KEY (`review_id`) REFERENCES `review` (`review_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_badge`
--
ALTER TABLE `user_badge`
  ADD CONSTRAINT `user_badge_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`users_id`),
  ADD CONSTRAINT `user_badge_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badge` (`id`),
  ADD CONSTRAINT `user_badge_ibfk_3` FOREIGN KEY (`source_level_id`) REFERENCES `level` (`id`),
  ADD CONSTRAINT `user_badge_ibfk_4` FOREIGN KEY (`source_category_id`) REFERENCES `quiz_category` (`id`),
  ADD CONSTRAINT `user_badge_ibfk_5` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempt` (`id`);

--
-- Constraints for table `user_category_progress`
--
ALTER TABLE `user_category_progress`
  ADD CONSTRAINT `user_category_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`users_id`),
  ADD CONSTRAINT `user_category_progress_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `quiz_category` (`id`);

--
-- Constraints for table `user_level_progress`
--
ALTER TABLE `user_level_progress`
  ADD CONSTRAINT `user_level_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`users_id`),
  ADD CONSTRAINT `user_level_progress_ibfk_2` FOREIGN KEY (`level_id`) REFERENCES `level` (`id`),
  ADD CONSTRAINT `user_level_progress_ibfk_3` FOREIGN KEY (`last_attempt_id`) REFERENCES `quiz_attempt` (`id`);

--
-- Constraints for table `user_points`
--
ALTER TABLE `user_points`
  ADD CONSTRAINT `user_points_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`users_id`);

--
-- Constraints for table `user_visit`
--
ALTER TABLE `user_visit`
  ADD CONSTRAINT `user_visit_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`users_id`),
  ADD CONSTRAINT `user_visit_ibfk_2` FOREIGN KEY (`tourist_place_id`) REFERENCES `tourist_place` (`tourist_place_id`);

--
-- Constraints for table `video_collection`
--
ALTER TABLE `video_collection`
  ADD CONSTRAINT `fk_video_collection_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`users_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
