const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  createSurvey,
  getSurveys,
  getSurvey,
  updateSurvey,
  deleteSurvey,
  publishSurvey,
  closeSurvey
} = require('../controllers/surveyController');
const {
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');
const {
  createOption,
  updateOption,
  deleteOption
} = require('../controllers/optionController');
const {
  submitResponse,
  getSurveyAnalytics
} = require('../controllers/responseController');

// Survey CRUD
router.post('/',
  authenticate,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    validate
  ],
  createSurvey
);

router.get('/', getSurveys);

router.get('/:id', getSurvey);

router.put('/:id',
  authenticate,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    validate
  ],
  updateSurvey
);

router.delete('/:id', authenticate, deleteSurvey);

router.post('/:id/publish', authenticate, publishSurvey);

router.post('/:id/close', authenticate, closeSurvey);

// Questions
router.post('/:surveyId/questions',
  authenticate,
  [
    body('text').trim().notEmpty().withMessage('Question text is required'),
    body('type').isIn(['single_choice', 'multiple_choice', 'text']).withMessage('Invalid question type'),
    body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    validate
  ],
  createQuestion
);

router.put('/:surveyId/questions/:questionId',
  authenticate,
  [
    body('text').optional().trim().notEmpty().withMessage('Question text cannot be empty'),
    body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    validate
  ],
  updateQuestion
);

router.delete('/:surveyId/questions/:questionId', authenticate, deleteQuestion);

// Options
router.post('/:surveyId/questions/:questionId/options',
  authenticate,
  [
    body('text').trim().notEmpty().withMessage('Option text is required'),
    body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    validate
  ],
  createOption
);

router.put('/:surveyId/questions/:questionId/options/:optionId',
  authenticate,
  [
    body('text').optional().trim().notEmpty().withMessage('Option text cannot be empty'),
    body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    validate
  ],
  updateOption
);

router.delete('/:surveyId/questions/:questionId/options/:optionId', authenticate, deleteOption);

// Responses
router.post('/:surveyId/responses',
  authenticate,
  [
    body('answers').isArray().withMessage('Answers must be an array'),
    body('answers.*.questionId').isInt().withMessage('Each answer must have a questionId'),
    validate
  ],
  submitResponse
);

router.get('/:surveyId/analytics', authenticate, getSurveyAnalytics);

module.exports = router;
