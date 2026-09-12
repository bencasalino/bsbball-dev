const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const Database = require('better-sqlite3');
const { getCareerTrajectoryData } = require('../server/trophy-case');

const db = new Database(path.join(__dirname, '..', 'data', 'league.db'), { readonly: true });
const manager = db.prepare("SELECT manager_id FROM managers WHERE name = 'Jonathan Hennke'").get();

test('career trajectory includes only seasons the selected manager played', () => {
  const trajectory = getCareerTrajectoryData(db, manager.manager_id);
  const participated = db.prepare('SELECT COUNT(*) AS count FROM season_results WHERE manager_id = ?').get(manager.manager_id).count;
  assert.equal(trajectory.seasons.length, participated);
  assert.equal(new Set(trajectory.seasons.map((season) => season.season_id)).size, participated);
  assert.equal(trajectory.career_summary.seasons, participated);
});

test('career trajectory uses regular-season results, playoff finishes, and cumulative GOAT points', () => {
  const trajectory = getCareerTrajectoryData(db, manager.manager_id);
  let cumulative = 0;
  trajectory.seasons.forEach((season) => {
    const games = season.wins + season.losses + season.ties;
    assert.equal(season.winning_percentage, games ? season.wins / games : 0);
    cumulative += season.goat_points_earned;
    assert.equal(season.cumulative_goat_score, cumulative);
    if (!season.playoffs_made) assert.equal(season.playoff_finish, null);
  });
  assert.equal(trajectory.career_summary.goat_score, cumulative);
});

test('career trajectory uses official championship rows rather than regular-season rank', () => {
  const trajectory = getCareerTrajectoryData(db, manager.manager_id);
  trajectory.seasons.filter((season) => season.playoff_finish === 1).forEach((season) => {
    const row = db.prepare('SELECT champion FROM season_results WHERE season_id = ? AND manager_id = ?').get(season.season_id, manager.manager_id);
    assert.equal(row.champion, 1);
  });
});

test('a manager who joined after the first season has no fabricated early seasons', () => {
  const lateManager = db.prepare('SELECT manager_id FROM managers WHERE joined_season > 1 ORDER BY joined_season DESC LIMIT 1').get();
  const trajectory = getCareerTrajectoryData(db, lateManager.manager_id);
  const firstActualSeason = db.prepare('SELECT MIN(s.season_number) AS season_number FROM season_results sr JOIN seasons s ON s.season_id = sr.season_id WHERE sr.manager_id = ?').get(lateManager.manager_id).season_number;
  assert.equal(trajectory.seasons[0].season_number, firstActualSeason);
});
