const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  responseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'responses',
      key: 'id'
    }
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'questions',
      key: 'id'
    }
  },
  optionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'options',
      key: 'id'
    }
  },
  textAnswer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'answers'
});

module.exports = Answer;
