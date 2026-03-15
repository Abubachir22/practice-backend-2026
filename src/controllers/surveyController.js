const { Survey, Question, Option, User, Response } = require('../models');
const { Op } = require('sequelize');

const createSurvey = async (req, res) => {
  try {
    const { title, description } = req.body;

    const survey = await Survey.create({
      title,
      description,
      authorId: req.user.id,
      status: 'draft'
    });

    res.status(201).json({
      message: 'Survey created successfully',
      survey
    });
  } catch (error) {
    console.error('Create survey error:', error);
    res.status(500).json({
      error: 'Failed to create survey',
      message: error.message
    });
  }
};

const getSurveys = async (req, res) => {
  try {
    const {
      status,
      mySurveys,
      filter,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where = {};

    // Фильтр "мои опросы"
    if (mySurveys === 'true') {
      where.authorId = req.user.id;
    }

    // Фильтр по статусу
    if (status) {
      where.status = status;
    }

    // Высокоуровневые фильтры: active/completed
    if (filter === 'active') {
      where.status = 'published';
    } else if (filter === 'completed') {
      where.status = 'closed';
    }

    // Пагинация
    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const pageSize = Number(limit) > 0 && Number(limit) <= 100 ? Number(limit) : 10;
    const offset = (pageNumber - 1) * pageSize;

    // Сортировка
    let order = [['createdAt', sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC']];

    // Поддержка сортировки по количеству ответов
    if (sortBy === 'responsesCount') {
      order = [[Response, 'id', sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC']];
    }

    const { rows, count } = await Survey.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
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
          as: 'responses',
          attributes: ['id']
        }
      ],
      distinct: true,
      order,
      limit: pageSize,
      offset
    });

    const surveys = rows.map((survey) => ({
      ...survey.toJSON(),
      responsesCount: survey.responses ? survey.responses.length : 0
    }));

    res.json({
      meta: {
        page: pageNumber,
        limit: pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      },
      filters: {
        status: where.status || null,
        mySurveys: mySurveys === 'true',
        filter: filter || null,
        sortBy,
        sortOrder: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc'
      },
      data: surveys
    });
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({
      error: 'Failed to get surveys',
      message: error.message
    });
  }
};

const getSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const { forResponse } = req.query;

    const survey = await Survey.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Question,
          as: 'questions',
          order: [['order', 'ASC']],
          include: [
            {
              model: Option,
              as: 'options',
              order: [['order', 'ASC']]
            }
          ]
        }
      ]
    });

    if (!survey) {
      return res.status(404).json({
        error: 'Survey not found',
        message: `Survey with id ${id} does not exist`
      });
    }

    // If requesting for response, check if survey is published
    if (forResponse === 'true') {
      if (survey.status !== 'published') {
        return res.status(403).json({
          error: 'Survey not available',
          message: 'Survey is not published'
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
    }

    res.json({
      survey
    });
  } catch (error) {
    console.error('Get survey error:', error);
    res.status(500).json({
      error: 'Failed to get survey',
      message: error.message
    });
  }
};

const updateSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const survey = await Survey.findByPk(id);

    if (!survey) {
      return res.status(404).json({
        error: 'Survey not found',
        message: `Survey with id ${id} does not exist`
      });
    }

    if (survey.authorId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only edit your own surveys'
      });
    }

    if (survey.status !== 'draft') {
      return res.status(403).json({
        error: 'Cannot edit published survey',
        message: 'You can only edit surveys in draft status'
      });
    }

    await survey.update({ title, description });

    res.json({
      message: 'Survey updated successfully',
      survey
    });
  } catch (error) {
    console.error('Update survey error:', error);
    res.status(500).json({
      error: 'Failed to update survey',
      message: error.message
    });
  }
};

const deleteSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findByPk(id);

    if (!survey) {
      return res.status(404).json({
        error: 'Survey not found',
        message: `Survey with id ${id} does not exist`
      });
    }

    if (survey.authorId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own surveys'
      });
    }

    await survey.destroy();

    res.json({
      message: 'Survey deleted successfully'
    });
  } catch (error) {
    console.error('Delete survey error:', error);
    res.status(500).json({
      error: 'Failed to delete survey',
      message: error.message
    });
  }
};

const publishSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findByPk(id, {
      include: [
        {
          model: Question,
          as: 'questions'
        }
      ]
    });

    if (!survey) {
      return res.status(404).json({
        error: 'Survey not found',
        message: `Survey with id ${id} does not exist`
      });
    }

    if (survey.authorId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only publish your own surveys'
      });
    }

    if (survey.status !== 'draft') {
      return res.status(400).json({
        error: 'Invalid status transition',
        message: `Survey is already ${survey.status}`
      });
    }

    if (survey.questions.length === 0) {
      return res.status(400).json({
        error: 'Cannot publish empty survey',
        message: 'Survey must have at least one question'
      });
    }

    await survey.update({ status: 'published' });

    res.json({
      message: 'Survey published successfully',
      survey
    });
  } catch (error) {
    console.error('Publish survey error:', error);
    res.status(500).json({
      error: 'Failed to publish survey',
      message: error.message
    });
  }
};

const closeSurvey = async (req, res) => {
  try {
    const { id } = req.params;

    const survey = await Survey.findByPk(id);

    if (!survey) {
      return res.status(404).json({
        error: 'Survey not found',
        message: `Survey with id ${id} does not exist`
      });
    }

    if (survey.authorId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only close your own surveys'
      });
    }

    if (survey.status !== 'published') {
      return res.status(400).json({
        error: 'Invalid status transition',
        message: `Can only close published surveys. Current status: ${survey.status}`
      });
    }

    await survey.update({ status: 'closed' });

    res.json({
      message: 'Survey closed successfully',
      survey
    });
  } catch (error) {
    console.error('Close survey error:', error);
    res.status(500).json({
      error: 'Failed to close survey',
      message: error.message
    });
  }
};

module.exports = {
  createSurvey,
  getSurveys,
  getSurvey,
  updateSurvey,
  deleteSurvey,
  publishSurvey,
  closeSurvey
};
