#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const ROOT = __dirname;
const DB_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DB_DIR, 'league.db');
const SCHEMA_SQL = path.join(ROOT, 'sql', 'schema.sql');
const CANONICAL_IMPORT = path.join(ROOT, 'canonical-import.js');

function readSql(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function main() {
  if (!fs.existsSync(SCHEMA_SQL)) {
    console.error('Missing schema file:', SCHEMA_SQL);
    process.exit(1);
  }

  if (!fs.existsSync(CANONICAL_IMPORT)) {
    console.error('Missing canonical import:', CANONICAL_IMPORT);
    process.exit(1);
  }

  fs.mkdirSync(DB_DIR, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    console.log('Removing existing database at', DB_PATH);
    fs.unlinkSync(DB_PATH);
  }

  console.log('Creating new SQLite DB at', DB_PATH);
  const db = new Database(DB_PATH);

  try {
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec(readSql(SCHEMA_SQL));
    require(CANONICAL_IMPORT)(db);
    console.log('Database created and seeded successfully.');
  } finally {
    db.close();
  }
}

if (require.main === module) {
  main();
}
