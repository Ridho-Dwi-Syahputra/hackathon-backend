-- Fix review_like triggers
-- Drop existing triggers
DROP TRIGGER IF EXISTS `after_review_like_insert`;
DROP TRIGGER IF EXISTS `after_review_like_delete`;

-- Create correct trigger for INSERT (with review_id not id)
DELIMITER $$
CREATE TRIGGER `after_review_like_insert` AFTER INSERT ON `review_like` FOR EACH ROW 
BEGIN
    UPDATE `review`
    SET total_likes = total_likes + 1
    WHERE review_id = NEW.review_id;
END$$
DELIMITER ;

-- Create correct trigger for DELETE (with review_id not id)
DELIMITER $$
CREATE TRIGGER `after_review_like_delete` AFTER DELETE ON `review_like` FOR EACH ROW 
BEGIN
    UPDATE `review` 
    SET total_likes = GREATEST(total_likes - 1, 0) 
    WHERE review_id = OLD.review_id;
END$$
DELIMITER ;
