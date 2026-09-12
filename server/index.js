const path = require('path');
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const { getTrophyCaseData: getCalculatedTrophyCaseData, getGoatData, getCareerTrajectoryData } = require('./trophy-case');

const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'data', 'league.db');
const INDEX_PATH = path.join(ROOT, 'index.html');
const HALL_OF_FAME_IDS = [1, 2];

const app = express();
app.use(cors());
app.use(express.json());
app.use('/css', express.static(path.join(ROOT, 'css')));
app.use('/js', express.static(path.join(ROOT, 'js')));
app.use('/fonts', express.static(path.join(ROOT, 'fonts')));
app.use('/images', express.static(path.join(ROOT, 'images')));

let db = null;
let lastDbError = null;

function getDbInstance() {
  if (db) return db;
  const fs = require('fs');
  if (!fs.existsSync(DB_PATH)) {
    console.log('Database file not found. Initializing database...');
    try {
      const initDb = require('../init-db');
      initDb();
    } catch (err) {
      console.error('Failed to auto-initialize DB:', err);
      lastDbError = err.message;
    }
  }
  try {
    db = new Database(DB_PATH);
    console.log('Opened database at', DB_PATH);
  } catch (err) {
    console.warn('Could not open database at', DB_PATH, '-', err.message);
    lastDbError = err.message;
    db = null;
  }
  return db;
}

// Attempt initial DB connection
getDbInstance();

function requireDb(res) {
  try {
    const instance = getDbInstance();
    if (!instance) {
      res.status(500).json({ error: `Database error: ${lastDbError || 'data/league.db not found'}` });
      return false;
    }
    return true;
  } catch (err) {
    res.status(500).json({ error: `Database exception: ${err.message || String(err)}` });
    return false;
  }
}

function safeNumber(value) {
  return Number(value || 0);
}

function formatWinningPercentage(wins, losses, ties = 0, gamesPlayed = null) {
  const totalGames = gamesPlayed == null
    ? safeNumber(wins) + safeNumber(losses) + safeNumber(ties)
    : safeNumber(gamesPlayed);
  if (!totalGames) return 0;
  return Number((safeNumber(wins) / totalGames).toFixed(3));
}

function getManagers() {
  return db.prepare('SELECT * FROM managers ORDER BY joined_season, name').all();
}

function getLeaderRows() {
  const rows = db.prepare(
    `SELECT
      m.manager_id,
      m.name,
      m.team_logo,
      m.team_color_1,
      m.team_color_2,
      m.active,
      m.joined_season,
      m.join_order,
      s.year AS joined_year,
      CASE WHEN s.year IS NULL THEN NULL ELSE s.year - 1 END AS est_year,
      COALESCE((SELECT COUNT(*) FROM season_results sr WHERE sr.manager_id = m.manager_id), 0) AS seasons_played,
      COALESCE((SELECT SUM(sr.wins) FROM season_results sr WHERE sr.manager_id = m.manager_id), 0) AS wins,
      COALESCE((SELECT SUM(sr.losses) FROM season_results sr WHERE sr.manager_id = m.manager_id), 0) AS losses,
      COALESCE((SELECT SUM(sr.ties) FROM season_results sr WHERE sr.manager_id = m.manager_id), 0) AS ties,
      COALESCE((SELECT SUM(CASE WHEN sr.regular_season_rank <= 8 THEN 1 ELSE 0 END) FROM season_results sr WHERE sr.manager_id = m.manager_id), 0) AS playoff_appearances,
      COALESCE((
        SELECT COUNT(*) FROM season_results sr
        WHERE sr.manager_id = m.manager_id
          AND (sr.champion = 1 OR sr.playoff_finish = 2 OR (sr.playoffs_made = 1 AND sr.champion = 0 AND sr.regular_season_rank = 2))
      ), 0) AS finals,
      COALESCE((SELECT SUM(sr.champion) FROM season_results sr WHERE sr.manager_id = m.manager_id), 0) AS championships,
      COALESCE((SELECT COUNT(*) FROM awards a WHERE a.manager_id = m.manager_id), 0) AS awards
     FROM managers m
     LEFT JOIN seasons s ON s.season_id = m.joined_season
     ORDER BY wins DESC, name ASC`
  ).all();

  return rows.map((row) => {
    const wins = safeNumber(row.wins);
    const losses = safeNumber(row.losses);
    const ties = safeNumber(row.ties);
    const gamesPlayed = wins + losses;

    return {
      ...row,
      wins,
      losses,
      ties,
      games_played: gamesPlayed,
      seasons_played: safeNumber(row.seasons_played),
      playoff_appearances: safeNumber(row.playoff_appearances),
      finals: safeNumber(row.finals),
      championships: safeNumber(row.championships),
      awards: safeNumber(row.awards),
      joined_season: row.joined_season == null ? null : safeNumber(row.joined_season),
      join_order: row.join_order == null ? null : safeNumber(row.join_order),
      joined_year: row.joined_year == null ? null : safeNumber(row.joined_year),
      est_year: row.est_year == null ? null : safeNumber(row.est_year),
      winning_percentage: formatWinningPercentage(wins, losses, ties, gamesPlayed),
    };
  });
}

function getLatestSeason() {
  return db.prepare('SELECT * FROM seasons ORDER BY season_number DESC LIMIT 1').get();
}

function getRecentChampion() {
  return db.prepare(
    `SELECT
      s.season_id,
      s.season_number,
      s.year,
      m.manager_id,
      m.name
     FROM awards a
     JOIN award_types at ON at.award_id = a.award_id
     JOIN seasons s ON s.season_id = a.season_id
     JOIN managers m ON m.manager_id = a.manager_id
     WHERE at.name = 'Championship'
     ORDER BY s.season_number DESC
     LIMIT 1`
  ).get() || null;
}

function getSeasonSummaries() {
  const summaries = db.prepare(
    `SELECT
      s.season_id,
      s.season_number,
      s.year,
      (
        SELECT m.name
        FROM awards a
        JOIN award_types at ON at.award_id = a.award_id
        JOIN managers m ON m.manager_id = a.manager_id
        WHERE a.season_id = s.season_id AND at.name = 'Championship'
        LIMIT 1
      ) AS champion_name,
      (
        SELECT printf('%d-%d', sr.wins, sr.losses)
        FROM season_results sr
        WHERE sr.season_id = s.season_id
        ORDER BY sr.wins DESC, sr.points_for DESC
        LIMIT 1
      ) AS winning_record,
      (
        SELECT COUNT(*)
        FROM season_results sr
        WHERE sr.season_id = s.season_id
      ) AS manager_count
     FROM seasons s
      ORDER BY s.season_number DESC`
    ).all().map((row) => ({
    ...row,
    manager_count: safeNumber(row.manager_count),
  }));
  const finishers = db.prepare(
    `SELECT season_id, regular_season_rank, m.name AS manager_name, m.team_logo, m.team_color_1, m.team_color_2
     FROM season_results sr
     JOIN managers m ON m.manager_id = sr.manager_id
     ORDER BY season_id, regular_season_rank ASC`
  ).all();
  const finishersBySeason = new Map();
  finishers.forEach((row) => {
    if (!finishersBySeason.has(row.season_id)) finishersBySeason.set(row.season_id, []);
    finishersBySeason.get(row.season_id).push({ rank: row.regular_season_rank, manager_name: row.manager_name, team_logo: row.team_logo, team_color_1: row.team_color_1, team_color_2: row.team_color_2 });
  });
  return summaries.map((summary) => ({
    ...summary,
    finishers: finishersBySeason.get(summary.season_id) || [],
  }));
}

function getSeasonDetail(seasonId) {
  const season = db.prepare('SELECT * FROM seasons WHERE season_id = ?').get(seasonId);
  if (!season) return null;

  const champion = db.prepare(
    `SELECT m.manager_id, m.name
     FROM awards a
     JOIN award_types at ON at.award_id = a.award_id
     JOIN managers m ON m.manager_id = a.manager_id
     WHERE a.season_id = ? AND at.name = 'Championship'
     LIMIT 1`
  ).get(seasonId) || null;

  const standings = db.prepare(
    `SELECT
      sr.manager_id,
      m.name AS manager_name,
      m.team_logo,
      m.team_color_1,
      m.team_color_2,
      sr.wins,
      sr.losses,
      sr.ties,
      sr.points_for,
      sr.regular_season_rank,
      sr.playoffs_made,
      CASE WHEN sr.regular_season_rank <= 8 THEN 1 ELSE 0 END AS computed_playoffs_made,
      (
        SELECT COUNT(*)
        FROM season_results sr2
        WHERE sr2.season_id = sr.season_id
      ) AS total_managers
     FROM season_results sr
     JOIN managers m ON m.manager_id = sr.manager_id
     WHERE sr.season_id = ?
     ORDER BY sr.regular_season_rank ASC, sr.wins DESC, sr.points_for DESC`
  ).all(seasonId).map((row) => ({
    ...row,
    wins: safeNumber(row.wins),
    losses: safeNumber(row.losses),
    ties: safeNumber(row.ties),
    points_for: safeNumber(row.points_for),
    regular_season_rank: safeNumber(row.regular_season_rank),
    playoffs_made: Boolean(row.playoffs_made) || safeNumber(row.computed_playoffs_made) === 1 || safeNumber(row.regular_season_rank) <= Math.min(8, safeNumber(row.total_managers)),
  }));

  return {
    season,
    champion,
    manager_count: standings.length,
    standings,
  };
}

function getRecordBookData() {
  const leaders = getLeaderRows();
  const seasons = db.prepare(
    `SELECT
      s.season_number,
      s.year,
      m.manager_id,
      m.name AS manager_name,
      m.team_logo,
      m.team_color_1,
      m.team_color_2,
      sr.wins,
      sr.losses,
      sr.ties,
      sr.points_for,
      sr.playoff_finish,
      sr.playoffs_made,
      sr.champion,
      sr.regular_season_rank,
      CASE WHEN sr.regular_season_rank = (
        SELECT MAX(sr_last.regular_season_rank)
        FROM season_results sr_last
        WHERE sr_last.season_id = sr.season_id
      ) THEN 1 ELSE 0 END AS is_last_place
     FROM season_results sr
     JOIN seasons s ON s.season_id = sr.season_id
     JOIN managers m ON m.manager_id = sr.manager_id`
  ).all().map((row) => ({
    ...row,
    wins: safeNumber(row.wins),
    losses: safeNumber(row.losses),
    ties: safeNumber(row.ties),
    points_for: safeNumber(row.points_for),
    playoff_finish: row.playoff_finish == null ? null : safeNumber(row.playoff_finish),
    playoffs_made: Boolean(row.playoffs_made),
    champion: Boolean(row.champion),
    regular_season_rank: safeNumber(row.regular_season_rank),
    is_last_place: Boolean(row.is_last_place),
    outcome: row.is_last_place
      ? 'Last Place'
      : row.champion
      ? 'Championship'
      : row.playoff_finish === 2 || (row.playoffs_made && row.regular_season_rank === 2)
        ? 'Finalist'
        : row.playoff_finish === 3 || (row.playoffs_made && row.regular_season_rank === 3)
          ? '3rd'
          : row.playoffs_made ? 'Playoffs' : 'Regular Season',
    winning_percentage: formatWinningPercentage(row.wins, row.losses, row.ties),
  }));

  const bestCareerWins = [...leaders].sort((a, b) => b.wins - a.wins || a.losses - b.losses)[0] || null;
  const mostChampionships = [...leaders].sort((a, b) => b.championships - a.championships || b.wins - a.wins)[0] || null;
  const bestCareerPct = [...leaders].filter((row) => row.seasons_played > 0).sort((a, b) => b.winning_percentage - a.winning_percentage || b.wins - a.wins)[0] || null;
  const mostSeasons = [...leaders].sort((a, b) => b.seasons_played - a.seasons_played || b.wins - a.wins)[0] || null;
  const mostPlayoffAppearances = [...leaders].sort((a, b) => b.playoff_appearances - a.playoff_appearances || b.wins - a.wins)[0] || null;

  const sortedByBestRecord = [...seasons].sort((a, b) => b.winning_percentage - a.winning_percentage || b.wins - a.wins || b.points_for - a.points_for);
  const sortedByWorstRecord = [...seasons].sort((a, b) => a.winning_percentage - b.winning_percentage || a.wins - b.wins || a.points_for - b.points_for);
  const sortedByMostWins = [...seasons].sort((a, b) => b.wins - a.wins || b.points_for - a.points_for);
  const sortedByFewestWins = [...seasons].sort((a, b) => a.wins - b.wins || a.points_for - b.points_for);
  const sortedByPointsFor = [...seasons].sort((a, b) => b.points_for - a.points_for || b.wins - a.wins);
  const topFive = (records) => records.slice(0, 5);
  const topTen = (records) => records.slice(0, 10);
  const careerSeasonStats = new Map();
  seasons.forEach((row) => {
    if (!careerSeasonStats.has(row.manager_id)) careerSeasonStats.set(row.manager_id, { runner_ups: 0, third_places: 0, best_regular_seasons: 0, last_places: 0, championships: 0, playoffs: 0 });
    const stats = careerSeasonStats.get(row.manager_id);
    const playoffFinish = row.playoff_finish || (row.playoffs_made && !row.champion && [2, 3].includes(row.regular_season_rank) ? row.regular_season_rank : null);
    stats.runner_ups += playoffFinish === 2 ? 1 : 0;
    stats.third_places += playoffFinish === 3 ? 1 : 0;
    stats.best_regular_seasons += row.regular_season_rank === 1 ? 1 : 0;
    stats.last_places += row.is_last_place ? 1 : 0;
    stats.championships += row.champion ? 1 : 0;
    stats.playoffs += row.playoffs_made ? 1 : 0;
  });
  const careerRows = leaders.map((row) => ({ ...row, ...(careerSeasonStats.get(row.manager_id) || {}) }));
  const careerCategories = [
    { key: 'championships', label: 'Championships', emoji: '🏆', records: topFive([...careerRows].sort((a, b) => b.championships - a.championships || b.wins - a.wins)).map((row) => ({ manager_name: row.name, value: row.championships, detail: `${row.championships} title${row.championships === 1 ? '' : 's'}` })) },
    { key: 'wins', label: 'Wins', emoji: '💯', records: topFive([...careerRows].sort((a, b) => b.wins - a.wins || a.losses - b.losses)).map((row) => ({ manager_name: row.name, value: row.wins, detail: `${row.wins} wins` })) },
    { key: 'winning_percentage', label: 'Win %', emoji: '📈', records: topFive([...careerRows].filter((row) => row.seasons_played > 0).sort((a, b) => b.winning_percentage - a.winning_percentage || b.wins - a.wins)).map((row) => ({ manager_name: row.name, value: `${(row.winning_percentage * 100).toFixed(1)}%`, detail: `${row.wins}–${row.losses}` })) },
    { key: 'playoffs', label: 'Playoff Appearances', emoji: '🎟️', records: topFive([...careerRows].sort((a, b) => b.playoffs - a.playoffs || b.wins - a.wins)).map((row) => ({ manager_name: row.name, value: row.playoffs, detail: `${row.playoffs} appearances` })) },
    { key: 'finals', label: 'Finals Appearances', emoji: '🥈', records: topFive([...careerRows].sort((a, b) => (b.championships + b.runner_ups) - (a.championships + a.runner_ups) || b.wins - a.wins)).map((row) => ({ manager_name: row.name, value: row.championships + row.runner_ups, detail: `${row.championships} titles, ${row.runner_ups} finalists` })) },
    { key: 'third_places', label: 'Top-3 Finishes', emoji: '🥉', records: topFive([...careerRows].sort((a, b) => b.third_places - a.third_places || b.wins - a.wins)).map((row) => ({ manager_name: row.name, value: row.third_places, detail: `${row.third_places} third-place finishes` })) },
    { key: 'best_regular_seasons', label: 'Best Regular Seasons', emoji: '📈', records: topFive([...careerRows].sort((a, b) => b.best_regular_seasons - a.best_regular_seasons || b.wins - a.wins)).map((row) => ({ manager_name: row.name, value: row.best_regular_seasons, detail: `${row.best_regular_seasons} best records` })) },
    { key: 'last_places', label: 'Last Places', emoji: '💩', records: topFive([...careerRows].sort((a, b) => b.last_places - a.last_places || a.wins - b.wins)).map((row) => ({ manager_name: row.name, value: row.last_places, detail: `${row.last_places} last-place finishes` })) },
    { key: 'seasons_played', label: 'Seasons Played', emoji: '📅', records: topFive([...careerRows].sort((a, b) => b.seasons_played - a.seasons_played || b.wins - a.wins)).map((row) => ({ manager_name: row.name, value: row.seasons_played, detail: `${row.seasons_played} seasons` })) },
  ];
  const improvements = [];
  const collapses = [];
  const seasonsByManager = new Map();
  seasons.forEach((row) => {
    if (!seasonsByManager.has(row.manager_id)) seasonsByManager.set(row.manager_id, []);
    seasonsByManager.get(row.manager_id).push(row);
  });
  seasonsByManager.forEach((managerSeasons) => {
    managerSeasons.sort((a, b) => a.season_number - b.season_number).forEach((row, index) => {
      const previous = managerSeasons[index - 1];
      if (!previous || row.season_number !== previous.season_number + 1) return;
      const change = row.wins - previous.wins;
      const record = { manager_name: row.manager_name, team_logo: row.team_logo, team_color_1: row.team_color_1, team_color_2: row.team_color_2, value: `${change > 0 ? '+' : ''}${change} wins`, detail: `S${previous.season_number} → S${row.season_number}` };
      if (change > 0) improvements.push({ ...record, change });
      if (change < 0) collapses.push({ ...record, change });
    });
  });
  const singleSeasonCategories = [
    { key: 'most_wins', label: 'Most Wins', emoji: '🔥', records: topTen([...seasons].sort((a, b) => b.wins - a.wins || a.losses - b.losses)).map((row) => ({ manager_name: row.manager_name, team_logo: row.team_logo, team_color_1: row.team_color_1, team_color_2: row.team_color_2, value: row.wins, detail: `S${row.season_number} (${row.year})` })) },
    { key: 'best_winning_percentage', label: 'Best Winning %', emoji: '📈', records: topTen([...seasons].sort((a, b) => b.winning_percentage - a.winning_percentage || b.wins - a.wins)).map((row) => ({ manager_name: row.manager_name, team_logo: row.team_logo, team_color_1: row.team_color_1, team_color_2: row.team_color_2, value: `${(row.winning_percentage * 100).toFixed(1)}%`, detail: `S${row.season_number} (${row.year})` })) },
    { key: 'biggest_improvement', label: 'Biggest Improvement', emoji: '🚀', records: topTen(improvements.sort((a, b) => b.change - a.change)) },
    { key: 'biggest_collapse', label: 'Biggest Collapse', emoji: '📉', records: topTen(collapses.sort((a, b) => a.change - b.change)) },
  ];
  const playoffCategories = [
    { key: 'championships', label: 'Most Championships', emoji: '🏆', records: careerCategories[0].records },
    { key: 'finals', label: 'Most Finals', emoji: '⚔️', records: careerCategories[4].records },
    { key: 'runner_ups', label: 'Most Runner-Ups', emoji: '🥈', records: topFive([...careerRows].sort((a, b) => b.runner_ups - a.runner_ups || b.wins - a.wins)).map((row) => ({ manager_name: row.name, value: row.runner_ups, detail: `${row.runner_ups} finalist finishes` })) },
    { key: 'third_places', label: 'Most 3rds', emoji: '🥉', records: careerCategories[5].records },
    { key: 'playoffs', label: 'Most Playoff Appearances', emoji: '🎟️', records: careerCategories[3].records },
  ];

  return {
    topBestSeasons: sortedByBestRecord.slice(0, 20),
    topWorstSeasons: sortedByWorstRecord.slice(0, 20),
    recordBookCategories: { career: careerCategories, singleSeason: singleSeasonCategories, playoffs: playoffCategories },
    careerRecords: [
      bestCareerWins && { key: 'Most Career Wins', manager_name: bestCareerWins.name, value: `${bestCareerWins.wins} wins` },
      mostChampionships && { key: 'Most Career Championships', manager_name: mostChampionships.name, value: `${mostChampionships.championships} championships` },
      bestCareerPct && { key: 'Best Career Winning Percentage', manager_name: bestCareerPct.name, value: bestCareerPct.winning_percentage.toFixed(3) },
      mostSeasons && { key: 'Most Seasons Played', manager_name: mostSeasons.name, value: `${mostSeasons.seasons_played} seasons` },
      mostPlayoffAppearances && { key: 'Most Playoff Appearances', manager_name: mostPlayoffAppearances.name, value: `${mostPlayoffAppearances.playoff_appearances} appearances` },
    ].filter(Boolean),
    singleSeasonRecords: [
      sortedByBestRecord[0] && { key: 'Best Record', manager_name: sortedByBestRecord[0].manager_name, value: `${sortedByBestRecord[0].wins}-${sortedByBestRecord[0].losses}`, season_number: sortedByBestRecord[0].season_number, year: sortedByBestRecord[0].year },
      sortedByMostWins[0] && { key: 'Most Wins', manager_name: sortedByMostWins[0].manager_name, value: `${sortedByMostWins[0].wins} wins`, season_number: sortedByMostWins[0].season_number, year: sortedByMostWins[0].year },
      sortedByFewestWins[0] && { key: 'Fewest Wins', manager_name: sortedByFewestWins[0].manager_name, value: `${sortedByFewestWins[0].wins} wins`, season_number: sortedByFewestWins[0].season_number, year: sortedByFewestWins[0].year },
      sortedByPointsFor[0] && { key: 'Highest Points For', manager_name: sortedByPointsFor[0].manager_name, value: `${sortedByPointsFor[0].points_for} points`, season_number: sortedByPointsFor[0].season_number, year: sortedByPointsFor[0].year },
    ].filter(Boolean),
  };
}

function getLeagueSummary() {
  const latestSeason = getLatestSeason();
  const leaders = getLeaderRows();
  const recentChampion = getRecentChampion();
  const seasons = getSeasonSummaries();
  const totalChampionships = db.prepare(
    `SELECT COUNT(*) AS count
     FROM awards a
     JOIN award_types at ON at.award_id = a.award_id
     WHERE at.name = 'Championship'`
  ).get().count;

  const mostWins = [...leaders].sort((a, b) => b.wins - a.wins || b.winning_percentage - a.winning_percentage)[0] || null;
  const bestWinPct = [...leaders].filter((row) => row.seasons_played > 0).sort((a, b) => b.winning_percentage - a.winning_percentage || b.wins - a.wins)[0] || null;
  const mostAwards = [...leaders].sort((a, b) => b.awards - a.awards || b.championships - a.championships)[0] || null;

  return {
    latestSeason,
    managerCount: getManagers().length,
    seasonCount: db.prepare('SELECT COUNT(*) AS count FROM seasons').get().count,
    totalChampionships: safeNumber(totalChampionships),
    recentChampion,
    highlights: [
      mostWins && { label: 'All-Time Wins Leader', value: `${mostWins.name} · ${mostWins.wins} wins` },
      bestWinPct && { label: 'Best Winning Percentage', value: `${bestWinPct.name} · ${bestWinPct.winning_percentage.toFixed(3)}` },
      mostAwards && { label: 'Most Awards', value: `${mostAwards.name} · ${mostAwards.awards} awards` },
      recentChampion && { label: 'Latest Champion', value: `${recentChampion.name} · Season ${recentChampion.season_number}` },
    ].filter(Boolean),
    featuredSeasons: seasons.slice(0, 3),
    hallOfFameIds: HALL_OF_FAME_IDS,
  };
}

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'BS Basketball League API' });
});

app.get('/api/league/summary', (req, res) => {
  if (!requireDb(res)) return;
  res.json(getLeagueSummary());
});

app.get('/api/leaders', (req, res) => {
  if (!requireDb(res)) return;
  res.json(getLeaderRows());
});

app.get('/api/managers', (req, res) => {
  if (!requireDb(res)) return;
  res.json(getManagers());
});

app.get('/api/managers/:id', (req, res) => {
  if (!requireDb(res)) return;
  const row = db.prepare('SELECT * FROM managers WHERE manager_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Manager not found' });
  res.json(row);
});

app.get('/api/seasons', (req, res) => {
  if (!requireDb(res)) return;
  res.json(getSeasonSummaries());
});

app.get('/api/seasons/:id', (req, res) => {
  if (!requireDb(res)) return;
  const detail = getSeasonDetail(req.params.id);
  if (!detail) return res.status(404).json({ error: 'Season not found' });
  res.json(detail);
});

app.get('/api/seasons/:id/results', (req, res) => {
  if (!requireDb(res)) return;
  const detail = getSeasonDetail(req.params.id);
  if (!detail) return res.status(404).json({ error: 'Season not found' });
  res.json(detail.standings);
});

app.get('/api/awards', (req, res) => {
  if (!requireDb(res)) return;
  const rows = db.prepare(
    `SELECT a.id, a.season_id, s.season_number, s.year, a.manager_id, m.name AS manager_name, at.name AS award_name
     FROM awards a
     JOIN award_types at ON at.award_id = a.award_id
     JOIN managers m ON m.manager_id = a.manager_id
     JOIN seasons s ON s.season_id = a.season_id
     ORDER BY s.season_number DESC, at.name ASC`
  ).all();
  res.json(rows);
});

app.get('/api/awards/manager/:managerId', (req, res) => {
  if (!requireDb(res)) return;
  const rows = db.prepare(
    `SELECT a.id, a.season_id, s.season_number, s.year, at.name AS award_name
     FROM awards a
     JOIN award_types at ON at.award_id = a.award_id
     JOIN seasons s ON s.season_id = a.season_id
     WHERE a.manager_id = ?
     ORDER BY s.season_number DESC`
  ).all(req.params.managerId);
  res.json(rows);
});

app.get('/api/trophy-case', (req, res) => {
  if (!requireDb(res)) return;
  res.json(getCalculatedTrophyCaseData(getDbInstance()));
});

app.get('/api/record-book', (req, res) => {
  if (!requireDb(res)) return;
  res.json(getRecordBookData());
});

app.get('/api/goat', (req, res) => {
  if (!requireDb(res)) return;
  res.json(getGoatData(getDbInstance()));
});

app.get('/api/career-trajectories/:managerId', (req, res) => {
  if (!requireDb(res)) return;
  const trajectory = getCareerTrajectoryData(getDbInstance(), req.params.managerId);
  if (!trajectory) return res.status(404).json({ error: 'Manager not found' });
  res.json(trajectory);
});

function sendIndex(req, res) {
  res.sendFile(INDEX_PATH);
}

app.get('/', sendIndex);
app.get('/leaders', sendIndex);
app.get('/seasons', sendIndex);
app.get(/^\/seasons\/\d+$/, sendIndex);
app.get('/trophy-case', sendIndex);
app.get('/hall-of-fame', sendIndex);
app.get('/record-book', sendIndex);
app.get('/goat', sendIndex);
app.get('/career-trajectories', sendIndex);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  if (!db) {
    console.log('Warning: database not available — run `npm run init-db` to create data/league.db');
  }
});
