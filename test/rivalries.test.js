const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const Database = require('better-sqlite3');
const { getHeadToHeadRivalryData } = require('../server/trophy-case');

const db = new Database(path.join(__dirname, '..', 'data', 'league.db'), { readonly: true });
const ben = db.prepare("SELECT manager_id FROM managers WHERE name = 'Ben Casalino'").get();
const jon = db.prepare("SELECT manager_id FROM managers WHERE name = 'Jonathan Hennke'").get();

test('head to head rivalry data returns valid comparison and games list', () => {
  const rivalry = getHeadToHeadRivalryData(db, ben.manager_id, jon.manager_id);
  assert.equal(rivalry.m1.name, 'Ben Casalino');
  assert.equal(rivalry.m2.name, 'Jonathan Hennke');
  assert.ok(rivalry.h2h.totalGames > 0);
  assert.equal(rivalry.h2h.m1Wins + rivalry.h2h.m2Wins, rivalry.h2h.totalGames);
  assert.ok(rivalry.taleOfTheTape.length >= 8);
  assert.ok(rivalry.games.length === rivalry.h2h.totalGames);
});

test('rivalry data returns null for identical or invalid managers', () => {
  assert.equal(getHeadToHeadRivalryData(db, ben.manager_id, ben.manager_id), null);
  assert.equal(getHeadToHeadRivalryData(db, 9999, 9998), null);
});
