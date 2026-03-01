const User = require('./User');
const Survey = require('./Survey');
const Question = require('./Question');
const Option = require('./Option');
const Response = require('./Response');
const Answer = require('./Answer');

// User associations
User.hasMany(Survey, { foreignKey: 'authorId', as: 'surveys' });
User.hasMany(Response, { foreignKey: 'respondentId', as: 'responses' });

// Survey associations
Survey.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Survey.hasMany(Question, { foreignKey: 'surveyId', as: 'questions' });
Survey.hasMany(Response, { foreignKey: 'surveyId', as: 'responses' });

// Question associations
Question.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });
Question.hasMany(Option, { foreignKey: 'questionId', as: 'options' });
Question.hasMany(Answer, { foreignKey: 'questionId', as: 'answers' });

// Option associations
Option.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });
Option.hasMany(Answer, { foreignKey: 'optionId', as: 'answers' });

// Response associations
Response.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });
Response.belongsTo(User, { foreignKey: 'respondentId', as: 'respondent' });
Response.hasMany(Answer, { foreignKey: 'responseId', as: 'answers' });

// Answer associations
Answer.belongsTo(Response, { foreignKey: 'responseId', as: 'response' });
Answer.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });
Answer.belongsTo(Option, { foreignKey: 'optionId', as: 'option' });

module.exports = {
  User,
  Survey,
  Question,
  Option,
  Response,
  Answer
};
