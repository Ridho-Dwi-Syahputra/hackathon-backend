//quizRoutes

const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/start', quizController.startQuiz);
router.post('/submit', quizController.submitQuiz);
router.get('/attempts/:attemptId', quizController.getQuizAttempt);

module.exports = router;