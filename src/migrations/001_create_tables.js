const sequelize = require('../config/database');

async function up() {
  const queryInterface = sequelize.getQueryInterface();

  // Users table
  await queryInterface.createTable('users', {
    id: {
      type: sequelize.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: sequelize.Sequelize.STRING(255),
      allowNull: false,
      unique: true
    },
    password: {
      type: sequelize.Sequelize.STRING(255),
      allowNull: false
    },
    name: {
      type: sequelize.Sequelize.STRING(255),
      allowNull: false
    },
    createdAt: {
      type: sequelize.Sequelize.DATE,
      allowNull: false
    },
    updatedAt: {
      type: sequelize.Sequelize.DATE,
      allowNull: false
    }
  });

  // Surveys table
  await queryInterface.createTable('surveys', {
    id: {
      type: sequelize.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: sequelize.Sequelize.STRING(255),
      allowNull: false
    },
    description: {
      type: sequelize.Sequelize.TEXT,
      allowNull: true
    },
    status: {
      type: sequelize.Sequelize.ENUM('draft', 'published', 'closed'),
      allowNull: false,
      defaultValue: 'draft'
    },
    authorId: {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    createdAt: {
      type: sequelize.Sequelize.DATE,
      allowNull: false
    },
    updatedAt: {
      type: sequelize.Sequelize.DATE,
      allowNull: false
    }
  });

  // Questions table
  await queryInterface.createTable('questions', {
    id: {
      type: sequelize.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    surveyId: {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'surveys',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    text: {
      type: sequelize.Sequelize.TEXT,
      allowNull: false
    },
    type: {
      type: sequelize.Sequelize.ENUM('single_choice', 'multiple_choice', 'text'),
      allowNull: false
    },
    order: {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    createdAt: {
      type: sequelize.Sequelize.DATE,
      allowNull: false
    },
    updatedAt: {
      type: sequelize.Sequelize.DATE,
      allowNull: false
    }
  });

  // Options table
  await queryInterface.createTable('options', {
    id: {
      type: sequelize.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    questionId: {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    text: {
      type: sequelize.Sequelize.STRING(255),
      allowNull: false
    },
    order: {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    createdAt: {
      type: sequelize.Sequelize.DATE,
      allowNull: false
    },
    updatedAt: {
      type: sequelize.Sequelize.DATE,
      allowNull: false
    }
  });

  // Responses table
  await queryInterface.createTable('responses', {
    id: {
      type: sequelize.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    surveyId: {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'surveys',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    respondentId: {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    createdAt: {
      type: sequelize.Sequelize.DATE,
      allowNull: false
    }
  });

  // Answers table
  await queryInterface.createTable('answers', {
    id: {
      type: sequelize.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    responseId: {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'responses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    questionId: {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    optionId: {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'options',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    textAnswer: {
      type: sequelize.Sequelize.TEXT,
      allowNull: true
    },
    createdAt: {
      type: sequelize.Sequelize.DATE,
      allowNull: false
    }
  });

  // Unique constraint: one response per user per survey
  await queryInterface.addIndex('responses', ['surveyId', 'respondentId'], {
    unique: true,
    name: 'unique_survey_respondent'
  });
}

async function down() {
  const queryInterface = sequelize.getQueryInterface();
  
  await queryInterface.dropTable('answers');
  await queryInterface.dropTable('responses');
  await queryInterface.dropTable('options');
  await queryInterface.dropTable('questions');
  await queryInterface.dropTable('surveys');
  await queryInterface.dropTable('users');
}

module.exports = { up, down };
