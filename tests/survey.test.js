const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const sequelize = require('../src/config/database');
const { User, Survey, Question, Option, Response } = require('../src/models');

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: '1h'
  });

describe('Survey business rules', () => {
  let author;
  let respondent;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    author = await User.create({
      email: 'author@test.com',
      password: 'password123',
      name: 'Author'
    });

    respondent = await User.create({
      email: 'respondent@test.com',
      password: 'password123',
      name: 'Respondent'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('published survey cannot be edited', async () => {
    const token = createToken(author.id);

    const survey = await Survey.create({
      title: 'Test survey',
      description: 'desc',
      authorId: author.id,
      status: 'published'
    });

    const res = await request(app)
      .put(`/api/surveys/${survey.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(403);
  });

  test('respondent cannot answer survey twice', async () => {
    const authorToken = createToken(author.id);
    const respondentToken = createToken(respondent.id);

    const surveyRes = await request(app)
      .post('/api/surveys')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ title: 'Once survey', description: '' });

    const surveyId = surveyRes.body.survey.id;

    const questionRes = await Question.create({
      surveyId,
      text: 'Q1',
      type: 'single_choice',
      order: 1
    });

    const option = await Option.create({
      questionId: questionRes.id,
      text: 'A1',
      order: 1
    });

    await Survey.update({ status: 'published' }, { where: { id: surveyId } });

    const firstResponse = await request(app)
      .post(`/api/surveys/${surveyId}/responses`)
      .set('Authorization', `Bearer ${respondentToken}`)
      .send({
        answers: [
          {
            questionId: questionRes.id,
            optionId: option.id
          }
        ]
      });

    expect(firstResponse.status).toBe(201);

    const secondResponse = await request(app)
      .post(`/api/surveys/${surveyId}/responses`)
      .set('Authorization', `Bearer ${respondentToken}`)
      .send({
        answers: [
          {
            questionId: questionRes.id,
            optionId: option.id
          }
        ]
      });

    expect(secondResponse.status).toBe(403);
  });

  test('validation: text question requires textAnswer', async () => {
    const authorToken = createToken(author.id);
    const respondentToken = createToken(respondent.id);

    const surveyRes = await request(app)
      .post('/api/surveys')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ title: 'Validation survey', description: '' });

    const surveyId = surveyRes.body.survey.id;

    const question = await Question.create({
      surveyId,
      text: 'Text Q',
      type: 'text',
      order: 1
    });

    await Survey.update({ status: 'published' }, { where: { id: surveyId } });

    const res = await request(app)
      .post(`/api/surveys/${surveyId}/responses`)
      .set('Authorization', `Bearer ${respondentToken}`)
      .send({
        answers: [
          {
            questionId: question.id
          }
        ]
      });

    expect(res.status).toBe(400);
  });
});

