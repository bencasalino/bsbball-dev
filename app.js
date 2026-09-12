const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'league.db');

// Auto-initialize SQLite database if it doesn't exist on server startup
if (!fs.existsSync(dbPath)) {
  console.log('Database file not found at startup. Auto-initializing database...');
  try {
    const initDb = require('./init-db.js');
    initDb();
  } catch (err) {
    console.error('Failed to auto-initialize database:', err);
  }
}

// Root wrapper for cPanel / Phusion Passenger deployment
require('./server/index.js');
