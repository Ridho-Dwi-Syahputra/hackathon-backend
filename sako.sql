-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 30, 2025 at 07:31 AM
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
    -- Update hanya rata-rata rating di tabel tourist_place
    UPDATE `tourist_place`
    SET 
        average_rating = (SELECT IFNULL(AVG(rating), 0) FROM review WHERE tourist_place_id = NEW.tourist_place_id)
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
-- Triggers `review_like`
--
DELIMITER $$
CREATE TRIGGER `after_review_like_delete` AFTER DELETE ON `review_like` FOR EACH ROW BEGIN
    UPDATE `review` SET total_likes = total_likes - 1 WHERE review_id = OLD.review_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_review_like_insert` AFTER INSERT ON `review_like` FOR EACH ROW UPDATE review
SET total_likes = total_likes + 1
WHERE id = NEW.review_id
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
  `image_url` varchar(512) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `average_rating` decimal(3,1) DEFAULT 0.0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tourist_place`
--

INSERT INTO `tourist_place` (`tourist_place_id`, `name`, `description`, `address`, `image_url`, `is_active`, `created_at`, `updated_at`, `average_rating`) VALUES
('TP001', 'Jam Gadang', 'Jam Gadang adalah ikon pariwisata Kota Bukittinggi yang menjulang setinggi 26 meter di jantung kota. Menara jam ini memiliki keunikan pada angka empat romawi yang ditulis IIII dan atap bagonjong yang mencerminkan arsitektur Minangkabau. Dibangun pada masa kolonial Belanda, tempat ini menawarkan pemandangan kota yang indah dan udara sejuk khas perbukitan.', 'Jl. Raya Bukittinggi - Payakumbuh, Benteng Ps. Atas, Bukittinggi', 'https://lqdmiwpsmufcwziayoev.supabase.co/storage/v1/object/public/sako-assets/tourist-places/TP001-jam-gadang.jpg', 1, '2025-11-29 15:16:28', '2025-11-30 03:33:33', 0.0),
('TP002', 'Museum Gudang Ransum', 'Terletak di Sawahlunto, museum ini merupakan bekas dapur umum yang dibangun pada tahun 1918 untuk pekerja tambang batubara. Koleksinya meliputi periuk dan kuali raksasa yang menjadi saksi bisu sejarah pertambangan \"Orang Rantai\" di era kolonial. Wisatawan dapat mempelajari sejarah kuliner massal dan teknologi uap yang digunakan pada masa lampau.', 'Jl. Abdul Rahman Hakim, Air Dingin, Sawahlunto', 'https://lqdmiwpsmufcwziayoev.supabase.co/storage/v1/object/public/sako-assets/tourist-places/TP002-museum-gudang-ransum.jpg', 1, '2025-11-29 15:16:28', '2025-11-30 03:46:57', 0.0),
('TP003', 'Pantai Air Manis', 'Pantai ini terkenal di seluruh nusantara sebagai lokasi legenda Malin Kundang si anak durhaka. Pengunjung dapat melihat formasi batu yang menyerupai pecahan kapal dan sosok manusia yang sedang bersujud memohon ampun di tepi pantai. Selain wisata sejarah, pantai ini menawarkan pasir cokelat yang luas dan pemandangan Gunung Padang yang memukau.', 'Jl. Malin Kundang, Air Manis, Padang Selatan, Kota Padang', 'https://lqdmiwpsmufcwziayoev.supabase.co/storage/v1/object/public/sako-assets/tourist-places/TP003-pantai-air-manis.jpg', 1, '2025-11-29 15:16:28', '2025-11-30 03:47:27', 0.0),
('TP004', 'Pantai Carocok', 'Primadona wisata di Painan, Pesisir Selatan ini menawarkan keindahan air laut yang jernih dan jembatan apung yang ikonik. Terhubung dengan Pulau Batu Kereta, kawasan ini menjadi spot favorit untuk menikmati matahari terbenam dan bermain wahana air. Suasana pantai yang tenang menjadikannya lokasi yang sempurna untuk rekreasi keluarga.', 'Jl. Pantai Carocok, Painan, Pesisir Selatan', 'https://lqdmiwpsmufcwziayoev.supabase.co/storage/v1/object/public/sako-assets/tourist-places/TP004-pantai-carocok.jpeg', 1, '2025-11-29 15:16:28', '2025-11-30 03:47:50', 0.0);

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
