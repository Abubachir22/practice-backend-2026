const { Response, Answer, Survey, Question, Option } = require('../models');
const { Op } = require('sequelize');

const submitResponse = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { answers } = req.body;

    const survey = await Survey.findByPk(surveyId, {
      include: [
        {
          model: Question,
          as: 'questions',
          include: [
            {
              model: Option,
              as: 'options'
            }
          ]
        }
      ]
    });

    if (!survey) {
      return res.status(404).json({
        error: 'Survey not found',
        message: `Survey with id ${surveyId} does not exist`
      });
    }

    if (survey.status !== 'published') {
      return res.status(403).json({
        error: 'Survey not available',
        message: `Survey is ${survey.status}. Only published surveys can be completed.`
      });
    }

    // Check if user already responded
    const existingResponse = await Response.findOne({
      where: {
        surveyId: survey.id,
        respondentId: req.user.id
      }
    });

    if (existingResponse) {
      return res.status(403).json({
        error: 'Already responded',
        message: 'You have already completed this survey'
      });
    }

    // Validate answers
    const questionsMap = new Map(survey.questions.map(q => [q.id, q]));
    const validationErrors = [];

    for (const answer of answers) {
      const question = questionsMap.get(answer.questionId);
      
      if (!question) {
        validationErrors.push(`Question with id ${answer.questionId} does not exist in this survey`);
        continue;
      }

      // Validate based on question type
      if (question.type === 'single_choice') {
        if (!answer.optionId) {
          validationErrors.push(`Question ${question.id} (single choice) requires an optionId`);
        } else {
          const option = question.options.find(o => o.id === answer.optionId);
          if (!option) {
            validationErrors.push(`Option ${answer.optionId} does not belong to question ${question.id}`);
          }
        }
        if (answer.textAnswer) {
          validationErrors.push(`Question ${question.id} (single choice) should not have textAnswer`);
        }
      } else if (question.type === 'multiple_choice') {
        if (!answer.optionIds || !Array.isArray(answer.optionIds) || answer.optionIds.length === 0) {
          validationErrors.push(`Question ${question.id} (multiple choice) requires at least one optionId in optionIds array`);
        } else {
          for (const optionId of answer.optionIds) {
            const option = question.options.find(o => o.id === optionId);
            if (!option) {
              validationErrors.push(`Option ${optionId} does not belong to question ${question.id}`);
            }
          }
        }
        if (answer.textAnswer) {
          validationErrors.push(`Question ${question.id} (multiple choice) should not have textAnswer`);
        }
      } else if (question.type === 'text') {
        if (!answer.textAnswer || answer.textAnswer.trim() === '') {
          validationErrors.push(`Question ${question.id} (text) requires a textAnswer`);
        }
        if (answer.optionId || answer.optionIds) {
          validationErrors.push(`Question ${question.id} (text) should not have optionId or optionIds`);
        }
      }
    }

    // Check if all questions are answered
    const answeredQuestionIds = new Set(answers.map(a => a.questionId));
    const allQuestionIds = new Set(survey.questions.map(q => q.id));
    
    if (answeredQuestionIds.size !== allQuestionIds.size) {
      const missingQuestions = Array.from(allQuestionIds).filter(id => !answeredQuestionIds.has(id));
      validationErrors.push(`Missing answers for questions: ${missingQuestions.join(', ')}`);
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: validationErrors
      });
    }

    // Create response
    const response = await Response.create({
      surveyId: survey.id,
      respondentId: req.user.id
    });

    // Create answers
    const answerPromises = [];
    
    for (const answerData of answers) {
      const question = questionsMap.get(answerData.questionId);
      
      if (question.type === 'single_choice') {
        answerPromises.push(
          Answer.create({
            responseId: response.id,
            questionId: question.id,
            optionId: answerData.optionId,
            textAnswer: null
          })
        );
      } else if (question.type === 'multiple_choice') {
        for (const optionId of answerData.optionIds) {
          answerPromises.push(
            Answer.create({
              responseId: response.id,
              questionId: question.id,
              optionId: optionId,
              textAnswer: null
            })
          );
        }
      } else if (question.type === 'text') {
        answerPromises.push(
          Answer.create({
            responseId: response.id,
            questionId: question.id,
            optionId: null,
            textAnswer: answerData.textAnswer
          })
        );
      }
    }

    await Promise.all(answerPromises);

    res.status(201).json({
      message: 'Response submitted successfully',
      responseId: response.id
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({
      error: 'Failed to submit response',
      message: error.message
    });
  }
};

const getSurveyAnalytics = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await Survey.findByPk(surveyId, {
      include: [
        {
          model: Question,
          as: 'questions',
          include: [
            {
              model: Option,
              as: 'options'
            }
          ]
        },
        {
          model: Response,
          as: 'responses'
        }
      ]
    });

    if (!survey) {
      return res.status(404).json({
        error: 'Survey not found',
        message: `Survey with id ${surveyId} does not exist`
      });
    }

    if (survey.authorId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view analytics for your own surveys'
      });
    }

    const totalResponses = survey.responses.length;

    const analytics = {
      surveyId: survey.id,
      title: survey.title,
      status: survey.status,
      totalResponses,
      questions: []
    };

    for (const question of survey.questions) {
      const questionAnalytics = {
        questionId: question.id,
        text: question.text,
        type: question.type
      };

      if (question.type === 'single_choice' || question.type === 'multiple_choice') {
        const optionStats = [];
        
        for (const option of question.options) {
          const answers = await Answer.findAll({
            where: {
              questionId: question.id,
              optionId: option.id
            },
            include: [
              {
                model: Response,
                as: 'response',
                where: {
                  surveyId: survey.id
                },
                required: true
              }
            ]
          });

          const answerCount = answers.length;
          const percentage = totalResponses > 0 
            ? ((answerCount / totalResponses) * 100).toFixed(2) 
            : 0;

          optionStats.push({
            optionId: option.id,
            text: option.text,
            count: answerCount,
            percentage: parseFloat(percentage)
          });
        }

        questionAnalytics.options = optionStats;
      } else if (question.type === 'text') {
        const textAnswers = await Answer.findAll({
          where: {
            questionId: question.id,
            textAnswer: { [Op.ne]: null }
          },
          include: [
            {
              model: Response,
              as: 'response',
              where: {
                surveyId: survey.id
              }
            }
          ],
          attributes: ['textAnswer', 'createdAt']
        });

        questionAnalytics.textAnswers = textAnswers.map(a => ({
          text: a.textAnswer,
          submittedAt: a.createdAt
        }));
      }

      analytics.questions.push(questionAnalytics);
    }

    res.json({
      analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      message: error.message
    });
  }
};

module.exports = {
  submitResponse,
  getSurveyAnalytics
};
