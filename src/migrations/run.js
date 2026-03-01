const sequelize = require('../config/database');
const migration = require('./001_create_tables');

async function runMigrations() {
  try {
    console.log('Running migrations...');
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    await migration.up();
    console.log('Migrations completed successfully.');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
