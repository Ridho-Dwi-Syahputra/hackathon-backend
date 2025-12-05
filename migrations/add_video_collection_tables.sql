-- ============================================
-- Migration: Video Collection Feature
-- Date: December 5, 2025
-- Description: Add tables for VIDEO collection/grouping feature
--              Users can organize their favorite videos into collections
-- ============================================

-- Table for storing VIDEO collection names/categories
CREATE TABLE `video_collection` (
  `id` char(36) NOT NULL,
  `id_user` char(36) NOT NULL,
  `nama_koleksi` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL COMMENT 'Optional: URL to collection cover image',
  `jumlah_video` int(11) DEFAULT 0 COMMENT 'Cached count of videos in collection',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_collection` (`id_user`),
  CONSTRAINT `fk_video_collection_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Junction table for many-to-many relationship between VIDEO collections and videos
CREATE TABLE `collection_video` (
  `id` char(36) NOT NULL,
  `id_collection` char(36) NOT NULL,
  `id_video` char(36) NOT NULL,
  `tanggal_ditambah` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_collection_video` (`id_collection`,`id_video`),
  KEY `idx_collection` (`id_collection`),
  KEY `idx_video` (`id_video`),
  CONSTRAINT `fk_cv_collection` FOREIGN KEY (`id_collection`) REFERENCES `video_collection` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cv_video` FOREIGN KEY (`id_video`) REFERENCES `video` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Trigger to update jumlah_video count when video is added to collection
DELIMITER $$
CREATE TRIGGER `after_collection_video_insert` 
AFTER INSERT ON `collection_video`
FOR EACH ROW
BEGIN
  UPDATE `video_collection` 
  SET `jumlah_video` = `jumlah_video` + 1 
  WHERE `id` = NEW.`id_collection`;
END$$
DELIMITER ;

-- Trigger to update jumlah_video count when video is removed from collection
DELIMITER $$
CREATE TRIGGER `after_collection_video_delete` 
AFTER DELETE ON `collection_video`
FOR EACH ROW
BEGIN
  UPDATE `video_collection` 
  SET `jumlah_video` = GREATEST(`jumlah_video` - 1, 0)
  WHERE `id` = OLD.`id_collection`;
END$$
DELIMITER ;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Uncomment below to insert sample VIDEO collections
-- INSERT INTO `video_collection` (`id`, `id_user`, `nama_koleksi`, `deskripsi`, `created_at`) 
-- VALUES 
-- ('550e8400-e29b-41d4-a716-446655440001', '<your_user_id>', 'Wisata Favorit', 'Koleksi video wisata yang ingin dikunjungi', NOW()),
-- ('550e8400-e29b-41d4-a716-446655440002', '<your_user_id>', 'Belajar Tari Minang', 'Video tutorial tarian tradisional Minangkabau', NOW()),
-- ('550e8400-e29b-41d4-a716-446655440003', '<your_user_id>', 'Kuliner Padang', 'Resep dan cara membuat masakan khas Padang', NOW());

-- ============================================
-- Rollback Script (if needed)
-- ============================================

-- To rollback this migration, run:
-- DROP TRIGGER IF EXISTS after_collection_video_delete;
-- DROP TRIGGER IF EXISTS after_collection_video_insert;
-- DROP TABLE IF EXISTS collection_video;
-- DROP TABLE IF EXISTS video_collection;
