const { Option, Question, Survey } = require('../models');

const createOption = async (req, res) => {
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
        message: 'You can only add options to questions in your own surveys'
      });
    }

    if (survey.status !== 'draft') {
      return res.status(403).json({
        error: 'Cannot edit published survey',
        message: 'You can only add options to questions in surveys in draft status'
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

    if (question.type === 'text') {
      return res.status(400).json({
        error: 'Invalid question type',
        message: 'Cannot add options to text questions'
      });
    }

    const option = await Option.create({
      questionId,
      text,
      order: order || 0
    });

    res.status(201).json({
      message: 'Option created successfully',
      option
    });
  } catch (error) {
    console.error('Create option error:', error);
    res.status(500).json({
      error: 'Failed to create option',
      message: error.message
    });
  }
};

const updateOption = async (req, res) => {
  try {
    const { surveyId, questionId, optionId } = req.params;
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
        message: 'You can only edit options in your own surveys'
      });
    }

    if (survey.status !== 'draft') {
      return res.status(403).json({
        error: 'Cannot edit published survey',
        message: 'You can only edit options in surveys in draft status'
      });
    }

    const option = await Option.findOne({
      where: {
        id: optionId,
        questionId
      },
      include: [
        {
          model: Question,
          as: 'question',
          where: { surveyId }
        }
      ]
    });

    if (!option) {
      return res.status(404).json({
        error: 'Option not found',
        message: `Option with id ${optionId} does not exist in this question`
      });
    }

    await option.update({ text, order });

    res.json({
      message: 'Option updated successfully',
      option
    });
  } catch (error) {
    console.error('Update option error:', error);
    res.status(500).json({
      error: 'Failed to update option',
      message: error.message
    });
  }
};

const deleteOption = async (req, res) => {
  try {
    const { surveyId, questionId, optionId } = req.params;

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
        message: 'You can only delete options from your own surveys'
      });
    }

    if (survey.status !== 'draft') {
      return res.status(403).json({
        error: 'Cannot edit published survey',
        message: 'You can only delete options from surveys in draft status'
      });
    }

    const option = await Option.findOne({
      where: {
        id: optionId,
        questionId
      },
      include: [
        {
          model: Question,
          as: 'question',
          where: { surveyId }
        }
      ]
    });

    if (!option) {
      return res.status(404).json({
        error: 'Option not found',
        message: `Option with id ${optionId} does not exist in this question`
      });
    }

    await option.destroy();

    res.json({
      message: 'Option deleted successfully'
    });
  } catch (error) {
    console.error('Delete option error:', error);
    res.status(500).json({
      error: 'Failed to delete option',
      message: error.message
    });
  }
};

module.exports = {
  createOption,
  updateOption,
  deleteOption
};
