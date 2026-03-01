const sequelize = require('../config/database');
const { seed } = require('./001_test_data');

async function runSeeders() {
  try {
    console.log('Running seeders...');
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    await seed();
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeeders();
