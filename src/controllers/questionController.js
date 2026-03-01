const { Question, Option, Survey } = require('../models');

const createQuestion = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { text, type, order } = req.body;

    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      return res.status(404).json({
        error: 'Survey not found',
        message: `Survey with id ${surveyId} does not exist`
      });
    }

    if (survey.authorId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only add questions to your own surveys'
      });
    }

    if (survey.status !== 'draft') {
      return res.status(403).json({
        error: 'Cannot edit published survey',
        message: 'You can only add questions to surveys in draft status'
      });
    }

    const question = await Question.create({
      surveyId,
      text,
      type,
      order: order || 0
    });

    res.status(201).json({
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      error: 'Failed to create question',
      message: error.message
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { surveyId, questionId } = req.params;
    const { text, order } = req.body;

    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      return res.status(404).json({
        error: 'Survey not found',
        message: `Survey with id ${surveyId} does not exist`
      });
    }

    if (survey.authorId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only edit questions in your own surveys'
      });
    }

    if (survey.status !== 'draft') {
      return res.status(403).json({
        error: 'Cannot edit published survey',
        message: 'You can only edit questions in surveys in draft status'
      });
    }

    const question = await Question.findOne({
      where: {
        id: questionId,
        surveyId
      }
    });

    if (!question) {
      return res.status(404).json({
        error: 'Question not found',
        message: `Question with id ${questionId} does not exist in this survey`
      });
    }

    await question.update({ text, order });

    res.json({
      message: 'Question updated successfully',
      question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      error: 'Failed to update question',
      message: error.message
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { surveyId, questionId } = req.params;

    const survey = await Survey.findByPk(surveyId);

    if (!survey) {
      return res.status(404).json({
        error: 'Survey not found',
        message: `Survey with id ${surveyId} does not exist`
      });
    }

    if (survey.authorId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete questions from your own surveys'
      });
    }

    if (survey.status !== 'draft') {
      return res.status(403).json({
        error: 'Cannot edit published survey',
        message: 'You can only delete questions from surveys in draft status'
      });
    }

    const question = await Question.findOne({
      where: {
        id: questionId,
        surveyId
      }
    });

    if (!question) {
      return res.status(404).json({
        error: 'Question not found',
        message: `Question with id ${questionId} does not exist in this survey`
      });
    }

    await question.destroy();

    res.json({
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      error: 'Failed to delete question',
      message: error.message
    });
  }
};

module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestion
};
