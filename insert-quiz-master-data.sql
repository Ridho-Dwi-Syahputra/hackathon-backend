-- ============================================================
-- INSERT DATA MASTER MODUL QUIZ - LENGKAP
-- Database: sako
-- Generated: 2025-12-11
-- ============================================================
-- PENTING: File ini berisi data master lengkap untuk modul quiz
-- Termasuk: level, prerequisite_level, question, question_option
-- ============================================================

USE sako;

-- ============================================================
-- STEP 0: INSERT KATEGORI QUIZ (JIKA BELUM ADA)
-- ============================================================
-- Hapus kategori lama jika sudah ada
DELETE FROM quiz_category WHERE id IN ('cat-001', 'cat-002', 'cat-003', 'cat-004');

-- Insert kategori baru
INSERT INTO `quiz_category` (`id`, `name`, `description`, `is_active`, `display_order`) VALUES
('cat-001', 'Sejarah Minangkabau', 'Jelajahi sejarah dan asal-usul Minangkabau', 1, 1),
('cat-002', 'Budaya & Tradisi', 'Pelajari budaya dan adat istiadat Minangkabau', 1, 2),
('cat-003', 'Wisata Sumbar', 'Kenali tempat wisata di Sumatera Barat', 1, 3),
('cat-004', 'Kuliner Khas', 'Temukan kekayaan kuliner Minangkabau', 1, 4);

-- ============================================================
-- STEP 1: DELETE DATA TRANSAKSI LAMA (OPSIONAL - UNCOMMENT JIKA PERLU CLEAN)
-- ============================================================
-- DELETE FROM attempt_answer;
-- DELETE FROM quiz_attempt;
-- DELETE FROM user_level_progress;
-- DELETE FROM user_category_progress;
-- DELETE FROM user_badge;

-- ============================================================
-- STEP 2: DELETE DATA MASTER LAMA
-- ============================================================
DELETE FROM prerequisite_level;
DELETE FROM question_option;
DELETE FROM question;
DELETE FROM level;
DELETE FROM badge;

-- ============================================================
-- STEP 3: INSERT BADGES
-- ============================================================

INSERT INTO `badge` (`id`, `name`, `description`, `image_url`, `criteria_type`, `criteria_value`, `is_active`) VALUES
('badge-001', 'Pemula Sejarah', 'Selesaikan level pertama kategori Sejarah dengan nilai 70% atau lebih', 'https://example.com/badges/pemula-sejarah.png', 'level_100_percent', '{\"level_id\": \"level-001\", \"min_percent\": 70}', 1),
('badge-002', 'Master Sejarah', 'Selesaikan semua level kategori Sejarah dengan nilai 100%', 'https://example.com/badges/master-sejarah.png', 'category_mastery', '{\"category_id\": \"cat-001\", \"min_percent\": 100}', 1),
('badge-003', 'Ahli Budaya', 'Selesaikan semua level kategori Budaya & Tradisi', 'https://example.com/badges/ahli-budaya.png', 'category_mastery', '{\"category_id\": \"cat-002\", \"min_percent\": 70}', 1),
('badge-004', 'Kolektor Poin', 'Kumpulkan total 500 poin', 'https://example.com/badges/kolektor-poin.png', 'points_total', '{\"min_points\": 500}', 1),
('badge-005', 'Streak 7 Hari', 'Mainkan quiz selama 7 hari berturut-turut', 'https://example.com/badges/streak-7.png', 'streak', '{\"days\": 7}', 1);

-- ============================================================
-- STEP 4: INSERT LEVEL BARU
-- ============================================================

INSERT INTO `level` (`id`, `category_id`, `name`, `description`, `time_limit_seconds`, `pass_condition_type`, `pass_threshold`, `base_xp`, `base_points`, `is_active`, `display_order`, `max_questions`) VALUES

-- KATEGORI 1: Sejarah Minangkabau (cat-001)
('level-001', 'cat-001', 'Asal Usul Minangkabau', 'Pelajari legenda dan asal usul nama Minangkabau', 300, 'percent_correct', 70.00, 50, 100, 1, 1, 10),
('level-002', 'cat-001', 'Kerajaan Pagaruyung', 'Mengenal sejarah Kerajaan Pagaruyung yang megah', 360, 'percent_correct', 70.00, 75, 150, 1, 2, 5),
('level-003', 'cat-001', 'Tokoh-Tokoh Bersejarah', 'Kenali tokoh-tokoh penting dalam sejarah Minangkabau', 420, 'percent_correct', 70.00, 100, 200, 1, 3, NULL),

-- KATEGORI 2: Budaya & Tradisi (cat-002)
('level-004', 'cat-002', 'Rumah Gadang', 'Arsitektur dan filosofi Rumah Gadang', 300, 'percent_correct', 70.00, 50, 100, 1, 1, 5),
('level-005', 'cat-002', 'Adat Perkawinan', 'Upacara dan tradisi perkawinan adat Minangkabau', 360, 'percent_correct', 70.00, 75, 150, 1, 2, NULL),
('level-006', 'cat-002', 'Sistem Matrilineal', 'Memahami sistem kekerabatan matrilineal', 420, 'percent_correct', 70.00, 100, 200, 1, 3, NULL),

-- KATEGORI 3: Wisata Sumbar (cat-003)
('level-007', 'cat-003', 'Jam Gadang & Kota Tua', 'Jelajahi landmark ikonik Bukittinggi', 300, 'percent_correct', 70.00, 50, 100, 1, 1, NULL),
('level-008', 'cat-003', 'Danau Maninjau & Singkarak', 'Keindahan danau-danau di Sumatera Barat', 360, 'percent_correct', 70.00, 75, 150, 1, 2, NULL),
('level-009', 'cat-003', 'Ngarai Sianok', 'Pesona jurang dan lembah hijau', 420, 'percent_correct', 70.00, 100, 200, 1, 3, NULL),

-- KATEGORI 4: Kuliner Khas (cat-004)
('level-010', 'cat-004', 'Rendang & Gulai', 'Masakan khas Minangkabau yang terkenal', 300, 'percent_correct', 70.00, 50, 100, 1, 1, 5),
('level-011', 'cat-004', 'Makanan Tradisional', 'Kenali berbagai makanan tradisional Minang', 360, 'percent_correct', 70.00, 75, 150, 1, 2, NULL),
('level-012', 'cat-004', 'Seni Memasak Padang', 'Filosofi dan teknik masakan Padang', 420, 'percent_correct', 70.00, 100, 200, 1, 3, NULL);

-- ============================================================
-- STEP 5: INSERT PREREQUISITE LEVEL
-- ============================================================

INSERT INTO `prerequisite_level` (`id`, `level_id`, `required_level_id`) VALUES

-- KATEGORI 1: Sejarah Minangkabau
('prereq-001', 'level-002', 'level-001'),
('prereq-002', 'level-003', 'level-002'),

-- KATEGORI 2: Budaya & Tradisi
('prereq-003', 'level-005', 'level-004'),
('prereq-004', 'level-006', 'level-005'),

-- KATEGORI 3: Wisata Sumbar
('prereq-005', 'level-008', 'level-007'),
('prereq-006', 'level-009', 'level-008'),

-- KATEGORI 4: Kuliner Khas
('prereq-007', 'level-011', 'level-010'),
('prereq-008', 'level-012', 'level-011');

-- ============================================================
-- STEP 6: INSERT QUESTIONS
-- ============================================================

INSERT INTO `question` (`id`, `level_id`, `text`, `points_correct`, `points_wrong`, `display_order`, `is_active`) VALUES

-- LEVEL 001: Asal Usul Minangkabau (10 soal)
('q-001', 'level-001', 'Siapa tokoh dalam legenda asal usul nama Minangkabau?', 10, 0, 1, 1),
('q-002', 'level-001', 'Apa arti kata \"Minangkabau\" menurut legenda?', 10, 0, 2, 1),
('q-003', 'level-001', 'Hewan apa yang diadu dalam legenda Minangkabau?', 10, 0, 3, 1),
('q-004', 'level-001', 'Dari mana asal nenek moyang orang Minangkabau menurut legenda?', 10, 0, 4, 1),
('q-005', 'level-001', 'Apa filosofi utama masyarakat Minangkabau?', 10, 0, 5, 1),
('q-006', 'level-001', 'Siapa yang memimpin masyarakat Minangkabau dalam sistem adat?', 10, 0, 6, 1),
('q-007', 'level-001', 'Apa sebutan untuk wilayah asal Minangkabau?', 10, 0, 7, 1),
('q-008', 'level-001', 'Tahun berapa kerajaan Pagaruyung didirikan (perkiraan)?', 10, 0, 8, 1),
('q-009', 'level-001', 'Apa nama sungai besar di Sumatera Barat?', 10, 0, 9, 1),
('q-010', 'level-001', 'Apa yang dimaksud dengan \"Alam Takambang Jadi Guru\"?', 10, 0, 10, 1),

-- LEVEL 002: Kerajaan Pagaruyung (5 soal)
('q-011', 'level-002', 'Siapa gelar pemimpin tertinggi Kerajaan Pagaruyung?', 10, 0, 1, 1),
('q-012', 'level-002', 'Di mana lokasi istana Kerajaan Pagaruyung?', 10, 0, 2, 1),
('q-013', 'level-002', 'Sistem pemerintahan apa yang diterapkan di Minangkabau?', 10, 0, 3, 1),
('q-014', 'level-002', 'Apa sebutan untuk dewan adat Minangkabau?', 10, 0, 4, 1),
('q-015', 'level-002', 'Berapa jumlah luhak di Minangkabau?', 10, 0, 5, 1),

-- LEVEL 004: Rumah Gadang (5 soal)
('q-016', 'level-004', 'Apa ciri khas atap Rumah Gadang?', 10, 0, 1, 1),
('q-017', 'level-004', 'Berapa jumlah ruangan tradisional dalam Rumah Gadang?', 10, 0, 2, 1),
('q-018', 'level-004', 'Apa nama hiasan khas di dinding Rumah Gadang?', 10, 0, 3, 1),
('q-019', 'level-004', 'Siapa yang memiliki hak waris Rumah Gadang?', 10, 0, 4, 1),
('q-020', 'level-004', 'Apa filosofi bentuk atap Rumah Gadang?', 10, 0, 5, 1),

-- LEVEL 010: Rendang & Gulai (5 soal)
('q-021', 'level-010', 'Apa bahan utama Rendang?', 10, 0, 1, 1),
('q-022', 'level-010', 'Berapa lama waktu memasak Rendang tradisional?', 10, 0, 2, 1),
('q-023', 'level-010', 'Apa perbedaan Rendang dan Kalio?', 10, 0, 3, 1),
('q-024', 'level-010', 'Apa nama hidangan Minang yang menggunakan santan kelapa?', 10, 0, 4, 1),
('q-025', 'level-010', 'Rendang berasal dari daerah mana di Sumatera Barat?', 10, 0, 5, 1);

-- ============================================================
-- STEP 7: INSERT QUESTION OPTIONS (100 options total)
-- ============================================================

INSERT INTO `question_option` (`id`, `question_id`, `label`, `text`, `is_correct`, `display_order`) VALUES

-- Question 001 options
('opt-001', 'q-001', 'A', 'Cindua Mato', 1, 1),
('opt-002', 'q-001', 'B', 'Datuk Perpatih', 0, 2),
('opt-003', 'q-001', 'C', 'Datuk Katumanggungan', 0, 3),
('opt-004', 'q-001', 'D', 'Rajo Babanding', 0, 4),

-- Question 002 options
('opt-005', 'q-002', 'A', 'Gunung yang Menang', 0, 1),
('opt-006', 'q-002', 'B', 'Kerbau yang Menang', 1, 2),
('opt-007', 'q-002', 'C', 'Sungai yang Menang', 0, 3),
('opt-008', 'q-002', 'D', 'Kampung yang Menang', 0, 4),

-- Question 003 options
('opt-009', 'q-003', 'A', 'Ayam', 0, 1),
('opt-010', 'q-003', 'B', 'Anjing', 0, 2),
('opt-011', 'q-003', 'C', 'Kerbau', 1, 3),
('opt-012', 'q-003', 'D', 'Kuda', 0, 4),

-- Question 004 options
('opt-013', 'q-004', 'A', 'Gunung Merapi', 0, 1),
('opt-014', 'q-004', 'B', 'Gunung Singgalang', 1, 2),
('opt-015', 'q-004', 'C', 'Gunung Sago', 0, 3),
('opt-016', 'q-004', 'D', 'Gunung Marapi', 0, 4),

-- Question 005 options
('opt-017', 'q-005', 'A', 'Individualisme', 0, 1),
('opt-018', 'q-005', 'B', 'Adat Basandi Syarak, Syarak Basandi Kitabullah', 1, 2),
('opt-019', 'q-005', 'C', 'Gotong Royong', 0, 3),
('opt-020', 'q-005', 'D', 'Demokrasi', 0, 4),

-- Question 006 options
('opt-021', 'q-006', 'A', 'Penghulu', 1, 1),
('opt-022', 'q-006', 'B', 'Raja', 0, 2),
('opt-023', 'q-006', 'C', 'Sultan', 0, 3),
('opt-024', 'q-006', 'D', 'Datuk', 0, 4),

-- Question 007 options
('opt-025', 'q-007', 'A', 'Tanah Datar', 0, 1),
('opt-026', 'q-007', 'B', 'Luhak Nan Tigo', 1, 2),
('opt-027', 'q-007', 'C', 'Padang Panjang', 0, 3),
('opt-028', 'q-007', 'D', 'Bukittinggi', 0, 4),

-- Question 008 options
('opt-029', 'q-008', 'A', 'Abad ke-14', 1, 1),
('opt-030', 'q-008', 'B', 'Abad ke-15', 0, 2),
('opt-031', 'q-008', 'C', 'Abad ke-16', 0, 3),
('opt-032', 'q-008', 'D', 'Abad ke-17', 0, 4),

-- Question 009 options
('opt-033', 'q-009', 'A', 'Sungai Kampar', 0, 1),
('opt-034', 'q-009', 'B', 'Sungai Batanghari', 1, 2),
('opt-035', 'q-009', 'C', 'Sungai Indragiri', 0, 3),
('opt-036', 'q-009', 'D', 'Sungai Musi', 0, 4),

-- Question 010 options
('opt-037', 'q-010', 'A', 'Alam adalah guru terbaik', 1, 1),
('opt-038', 'q-010', 'B', 'Alam adalah harta', 0, 2),
('opt-039', 'q-010', 'C', 'Alam adalah rumah', 0, 3),
('opt-040', 'q-010', 'D', 'Alam adalah warisan', 0, 4),

-- Question 011 options
('opt-041', 'q-011', 'A', 'Sultan', 0, 1),
('opt-042', 'q-011', 'B', 'Yang Dipertuan', 1, 2),
('opt-043', 'q-011', 'C', 'Raja', 0, 3),
('opt-044', 'q-011', 'D', 'Datuk', 0, 4),

-- Question 012 options
('opt-045', 'q-012', 'A', 'Padang', 0, 1),
('opt-046', 'q-012', 'B', 'Batusangkar', 1, 2),
('opt-047', 'q-012', 'C', 'Bukittinggi', 0, 3),
('opt-048', 'q-012', 'D', 'Payakumbuh', 0, 4),

-- Question 013 options
('opt-049', 'q-013', 'A', 'Monarki', 0, 1),
('opt-050', 'q-013', 'B', 'Demokrasi', 0, 2),
('opt-051', 'q-013', 'C', 'Demokrasi Adat', 1, 3),
('opt-052', 'q-013', 'D', 'Republik', 0, 4),

-- Question 014 options
('opt-053', 'q-014', 'A', 'KAN (Kerapatan Adat Nagari)', 1, 1),
('opt-054', 'q-014', 'B', 'DPR', 0, 2),
('opt-055', 'q-014', 'C', 'MPR', 0, 3),
('opt-056', 'q-014', 'D', 'DPRD', 0, 4),

-- Question 015 options
('opt-057', 'q-015', 'A', '2', 0, 1),
('opt-058', 'q-015', 'B', '3', 1, 2),
('opt-059', 'q-015', 'C', '4', 0, 3),
('opt-060', 'q-015', 'D', '5', 0, 4),

-- Question 016 options
('opt-061', 'q-016', 'A', 'Datar', 0, 1),
('opt-062', 'q-016', 'B', 'Gonjong (tanduk kerbau)', 1, 2),
('opt-063', 'q-016', 'C', 'Bulat', 0, 3),
('opt-064', 'q-016', 'D', 'Piramida', 0, 4),

-- Question 017 options
('opt-065', 'q-017', 'A', '5', 0, 1),
('opt-066', 'q-017', 'B', '7', 0, 2),
('opt-067', 'q-017', 'C', '9', 1, 3),
('opt-068', 'q-017', 'D', '11', 0, 4),

-- Question 018 options
('opt-069', 'q-018', 'A', 'Batik', 0, 1),
('opt-070', 'q-018', 'B', 'Ukiran', 1, 2),
('opt-071', 'q-018', 'C', 'Lukisan', 0, 3),
('opt-072', 'q-018', 'D', 'Mosaik', 0, 4),

-- Question 019 options
('opt-073', 'q-019', 'A', 'Anak laki-laki', 0, 1),
('opt-074', 'q-019', 'B', 'Anak perempuan', 1, 2),
('opt-075', 'q-019', 'C', 'Anak tertua', 0, 3),
('opt-076', 'q-019', 'D', 'Semua anak', 0, 4),

-- Question 020 options
('opt-077', 'q-020', 'A', 'Keindahan', 0, 1),
('opt-078', 'q-020', 'B', 'Kekuatan', 0, 2),
('opt-079', 'q-020', 'C', 'Kejayaan dan semangat juang', 1, 3),
('opt-080', 'q-020', 'D', 'Kemakmuran', 0, 4),

-- Question 021 options
('opt-081', 'q-021', 'A', 'Ayam', 0, 1),
('opt-082', 'q-021', 'B', 'Daging sapi', 1, 2),
('opt-083', 'q-021', 'C', 'Ikan', 0, 3),
('opt-084', 'q-021', 'D', 'Kambing', 0, 4),

-- Question 022 options
('opt-085', 'q-022', 'A', '2 jam', 0, 1),
('opt-086', 'q-022', 'B', '4-6 jam', 1, 2),
('opt-087', 'q-022', 'C', '1 jam', 0, 3),
('opt-088', 'q-022', 'D', '30 menit', 0, 4),

-- Question 023 options
('opt-089', 'q-023', 'A', 'Bumbu berbeda', 0, 1),
('opt-090', 'q-023', 'B', 'Kalio lebih berkuah', 1, 2),
('opt-091', 'q-023', 'C', 'Rendang lebih pedas', 0, 3),
('opt-092', 'q-023', 'D', 'Tidak ada perbedaan', 0, 4),

-- Question 024 options
('opt-093', 'q-024', 'A', 'Soto', 0, 1),
('opt-094', 'q-024', 'B', 'Gulai', 1, 2),
('opt-095', 'q-024', 'C', 'Sate', 0, 3),
('opt-096', 'q-024', 'D', 'Bakso', 0, 4),

-- Question 025 options
('opt-097', 'q-025', 'A', 'Padang', 0, 1),
('opt-098', 'q-025', 'B', 'Lima Puluh Koto', 1, 2),
('opt-099', 'q-025', 'C', 'Bukittinggi', 0, 3),
('opt-100', 'q-025', 'D', 'Payakumbuh', 0, 4);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check total levels per category
SELECT 
    qc.id as category_id,
    qc.name as category_name,
    COUNT(l.id) as total_levels
FROM quiz_category qc
LEFT JOIN level l ON qc.id = l.category_id
GROUP BY qc.id, qc.name
ORDER BY qc.display_order;

-- Check level prerequisites
SELECT 
    l.name as level_name,
    GROUP_CONCAT(req_l.name SEPARATOR ', ') as requires
FROM level l
LEFT JOIN prerequisite_level pl ON l.id = pl.level_id
LEFT JOIN level req_l ON pl.required_level_id = req_l.id
GROUP BY l.id, l.name
ORDER BY l.display_order;

-- Check questions distribution per level
SELECT 
    l.id as level_id,
    l.name as level_name,
    l.category_id,
    COUNT(q.id) as total_questions,
    l.max_questions
FROM level l
LEFT JOIN question q ON l.id = q.level_id
GROUP BY l.id, l.name, l.category_id, l.max_questions
ORDER BY l.category_id, l.display_order;

-- ============================================================
-- SUMMARY DATA MASTER
-- ============================================================
-- TOTAL:
-- - 4 Categories (cat-001 to cat-004)
-- - 5 Badges (badge-001 to badge-005)
-- - 12 Levels (3 per category)
-- - 8 Prerequisites (level 2 & 3 tiap category butuh level sebelumnya)
-- - 25 Questions
-- - 100 Options (4 per question)
--
-- DISTRIBUSI SOAL:
-- - Level 001 (Sejarah): 10 soal (q-001 s/d q-010)
-- - Level 002 (Sejarah): 5 soal (q-011 s/d q-015)
-- - Level 003 (Sejarah): 0 soal (belum ada)
-- - Level 004 (Budaya): 5 soal (q-016 s/d q-020)
-- - Level 005 (Budaya): 0 soal (belum ada)
-- - Level 006 (Budaya): 0 soal (belum ada)
-- - Level 007 (Wisata): 0 soal (belum ada)
-- - Level 008 (Wisata): 0 soal (belum ada)
-- - Level 009 (Wisata): 0 soal (belum ada)
-- - Level 010 (Kuliner): 5 soal (q-021 s/d q-025)
-- - Level 011 (Kuliner): 0 soal (belum ada)
-- - Level 012 (Kuliner): 0 soal (belum ada)
--
-- LEVEL UNLOCKED (tanpa prerequisite):
-- - level-001 (Sejarah)
-- - level-004 (Budaya)
-- - level-007 (Wisata)
-- - level-010 (Kuliner)
-- ============================================================
