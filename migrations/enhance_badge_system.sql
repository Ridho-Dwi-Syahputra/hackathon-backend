-- ============================================================================
-- BADGE SYSTEM ENHANCEMENT
-- Menambah kolom tracking dan dummy data badge lebih lengkap
-- ============================================================================

-- 1. Tambah kolom di user_badge untuk tracking viewed status
ALTER TABLE `user_badge` 
ADD COLUMN `is_viewed` TINYINT(1) DEFAULT 0 AFTER `attempt_id`,
ADD COLUMN `viewed_at` TIMESTAMP NULL AFTER `is_viewed`;

-- 2. Pastikan user_points table exists (jika belum ada)
CREATE TABLE IF NOT EXISTS `user_points` (
  `user_id` char(36) NOT NULL,
  `total_points` int(11) DEFAULT 0,
  `lifetime_points` int(11) DEFAULT 0,
  `last_updated_at` timestamp NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_points_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`users_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Hapus badge lama dan insert data badge baru yang lebih lengkap
DELETE FROM `user_badge`;
DELETE FROM `badge`;

-- 4. Insert Badge Master Data - Lebih Lengkap
INSERT INTO `badge` (`id`, `name`, `description`, `image_url`, `criteria_type`, `criteria_value`, `is_active`, `created_at`) VALUES

-- BADGE LEVEL COMPLETION
('badge-001', 'Pemula Sejarah', 'Selesaikan level "Asal Usul Minangkabau" dengan nilai 70% atau lebih', 'https://res.cloudinary.com/sako/image/upload/badges/pemula-sejarah.png', 'level_100_percent', '{"level_id": "level-001", "min_percent": 70}', 1, NOW()),
('badge-002', 'Ahli Kerajaan', 'Selesaikan level "Kerajaan Pagaruyung" dengan nilai 100%', 'https://res.cloudinary.com/sako/image/upload/badges/ahli-kerajaan.png', 'level_100_percent', '{"level_id": "level-002", "min_percent": 100}', 1, NOW()),
('badge-003', 'Master Budaya', 'Selesaikan level "Rumah Gadang" dengan sempurna', 'https://res.cloudinary.com/sako/image/upload/badges/master-budaya.png', 'level_100_percent', '{"level_id": "level-004", "min_percent": 100}', 1, NOW()),
('badge-004', 'Pakar Kuliner', 'Selesaikan level "Rendang & Gulai" dengan nilai 100%', 'https://res.cloudinary.com/sako/image/upload/badges/pakar-kuliner.png', 'level_100_percent', '{"level_id": "level-010", "min_percent": 100}', 1, NOW()),

-- BADGE CATEGORY MASTERY
('badge-005', 'Master Sejarah', 'Selesaikan SEMUA level kategori Sejarah dengan nilai 100%', 'https://res.cloudinary.com/sako/image/upload/badges/master-sejarah.png', 'category_mastery', '{"category_id": "cat-001", "min_percent": 100}', 1, NOW()),
('badge-006', 'Ahli Budaya & Tradisi', 'Selesaikan SEMUA level kategori Budaya & Tradisi dengan nilai 80%+', 'https://res.cloudinary.com/sako/image/upload/badges/ahli-budaya.png', 'category_mastery', '{"category_id": "cat-002", "min_percent": 80}', 1, NOW()),
('badge-007', 'Penjelajah Wisata', 'Selesaikan SEMUA level kategori Wisata Sumbar', 'https://res.cloudinary.com/sako/image/upload/badges/penjelajah-wisata.png', 'category_mastery', '{"category_id": "cat-003", "min_percent": 70}', 1, NOW()),
('badge-008', 'Koki Minang', 'Selesaikan SEMUA level kategori Kuliner Khas', 'https://res.cloudinary.com/sako/image/upload/badges/koki-minang.png', 'category_mastery', '{"category_id": "cat-004", "min_percent": 70}', 1, NOW()),

-- BADGE POINTS MILESTONE
('badge-009', 'Kolektor Pemula', 'Kumpulkan total 100 poin', 'https://res.cloudinary.com/sako/image/upload/badges/kolektor-pemula.png', 'points_total', '{"min_points": 100}', 1, NOW()),
('badge-010', 'Kolektor Menengah', 'Kumpulkan total 500 poin', 'https://res.cloudinary.com/sako/image/upload/badges/kolektor-menengah.png', 'points_total', '{"min_points": 500}', 1, NOW()),
('badge-011', 'Kolektor Ahli', 'Kumpulkan total 1000 poin', 'https://res.cloudinary.com/sako/image/upload/badges/kolektor-ahli.png', 'points_total', '{"min_points": 1000}', 1, NOW()),
('badge-012', 'Kolektor Master', 'Kumpulkan total 2500 poin', 'https://res.cloudinary.com/sako/image/upload/badges/kolektor-master.png', 'points_total', '{"min_points": 2500}', 1, NOW()),
('badge-013', 'Kolektor Legend', 'Kumpulkan total 5000 poin', 'https://res.cloudinary.com/sako/image/upload/badges/kolektor-legend.png', 'points_total', '{"min_points": 5000}', 1, NOW()),

-- BADGE STREAK (Play Consecutive Days)
('badge-014', 'Konsisten 3 Hari', 'Mainkan quiz selama 3 hari berturut-turut', 'https://res.cloudinary.com/sako/image/upload/badges/streak-3.png', 'streak', '{"days": 3}', 1, NOW()),
('badge-015', 'Konsisten 7 Hari', 'Mainkan quiz selama 7 hari berturut-turut', 'https://res.cloudinary.com/sako/image/upload/badges/streak-7.png', 'streak', '{"days": 7}', 1, NOW()),
('badge-016', 'Konsisten 14 Hari', 'Mainkan quiz selama 14 hari berturut-turut', 'https://res.cloudinary.com/sako/image/upload/badges/streak-14.png', 'streak', '{"days": 14}', 1, NOW()),
('badge-017', 'Konsisten 30 Hari', 'Mainkan quiz selama 30 hari berturut-turut', 'https://res.cloudinary.com/sako/image/upload/badges/streak-30.png', 'streak', '{"days": 30}', 1, NOW()),

-- BADGE SPECIAL ACHIEVEMENTS
('badge-018', 'Perfeksionis', 'Dapatkan skor 100% pada 5 level berbeda', 'https://res.cloudinary.com/sako/image/upload/badges/perfeksionis.png', 'custom', '{"type": "perfect_score_count", "count": 5}', 1, NOW()),
('badge-019', 'Speedster', 'Selesaikan quiz dalam waktu kurang dari 30 detik (untuk level 5 soal)', 'https://res.cloudinary.com/sako/image/upload/badges/speedster.png', 'custom', '{"type": "fast_completion", "max_seconds": 30}', 1, NOW()),
('badge-020', 'Penakluk Semua', 'Selesaikan SEMUA level di SEMUA kategori', 'https://res.cloudinary.com/sako/image/upload/badges/penakluk-semua.png', 'custom', '{"type": "complete_all"}', 1, NOW());

-- 5. Commit
COMMIT;
