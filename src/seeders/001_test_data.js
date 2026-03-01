const { User, Survey, Question, Option } = require('../models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('Seeding test data...');

    // Create test users
    const author1 = await User.create({
      email: 'author1@test.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Author One'
    });

    const author2 = await User.create({
      email: 'author2@test.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Author Two'
    });

    const respondent1 = await User.create({
      email: 'respondent1@test.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Respondent One'
    });

    console.log('Test users created');

    // Create test survey 1 (draft)
    const survey1 = await Survey.create({
      title: 'Customer Satisfaction Survey',
      description: 'Help us improve our service by sharing your feedback',
      status: 'draft',
      authorId: author1.id
    });

    const question1 = await Question.create({
      surveyId: survey1.id,
      text: 'How satisfied are you with our service?',
      type: 'single_choice',
      order: 1
    });

    await Option.create({ questionId: question1.id, text: 'Very satisfied', order: 1 });
    await Option.create({ questionId: question1.id, text: 'Satisfied', order: 2 });
    await Option.create({ questionId: question1.id, text: 'Neutral', order: 3 });
    await Option.create({ questionId: question1.id, text: 'Dissatisfied', order: 4 });
    await Option.create({ questionId: question1.id, text: 'Very dissatisfied', order: 5 });

    const question2 = await Question.create({
      surveyId: survey1.id,
      text: 'What features would you like to see? (Select all that apply)',
      type: 'multiple_choice',
      order: 2
    });

    await Option.create({ questionId: question2.id, text: 'Mobile app', order: 1 });
    await Option.create({ questionId: question2.id, text: 'Better UI', order: 2 });
    await Option.create({ questionId: question2.id, text: 'More integrations', order: 3 });
    await Option.create({ questionId: question2.id, text: 'Faster performance', order: 4 });

    const question3 = await Question.create({
      surveyId: survey1.id,
      text: 'Any additional comments?',
      type: 'text',
      order: 3
    });

    console.log('Test survey 1 (draft) created');

    // Create test survey 2 (published)
    const survey2 = await Survey.create({
      title: 'Product Feedback',
      description: 'Tell us what you think about our product',
      status: 'published',
      authorId: author2.id
    });

    const question4 = await Question.create({
      surveyId: survey2.id,
      text: 'How would you rate our product?',
      type: 'single_choice',
      order: 1
    });

    await Option.create({ questionId: question4.id, text: 'Excellent', order: 1 });
    await Option.create({ questionId: question4.id, text: 'Good', order: 2 });
    await Option.create({ questionId: question4.id, text: 'Average', order: 3 });
    await Option.create({ questionId: question4.id, text: 'Poor', order: 4 });

    const question5 = await Question.create({
      surveyId: survey2.id,
      text: 'What is your favorite feature?',
      type: 'text',
      order: 2
    });

    console.log('Test survey 2 (published) created');

    console.log('Seeding completed successfully!');
    console.log('\nTest users:');
    console.log('  Author 1: author1@test.com / password123');
    console.log('  Author 2: author2@test.com / password123');
    console.log('  Respondent 1: respondent1@test.com / password123');
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
}

module.exports = { seed };
