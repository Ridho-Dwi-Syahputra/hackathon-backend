const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

// Semua route butuh authentication
router.use(auth);

// POST /api/quiz/start - Mulai quiz
router.post('/start', quizController.startQuiz);

// POST /api/quiz/submit - Submit jawaban quiz
router.post('/submit', quizController.submitQuiz);

module.exports = router;
