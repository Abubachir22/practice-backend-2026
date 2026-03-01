const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Response = sequelize.define('Response', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  surveyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'surveys',
      key: 'id'
    }
  },
  respondentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'responses',
  indexes: [
    {
      unique: true,
      fields: ['surveyId', 'respondentId']
    }
  ]
});

module.exports = Response;
