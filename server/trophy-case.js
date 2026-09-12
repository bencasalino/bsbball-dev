const AWARD_TYPES = [
  { code: 'CHAMPIONSHIP', name: 'Championship', emoji: '🏆' },
  { code: 'RUNNER_UP', name: 'Runner-Up', emoji: '🥈' },
  { code: 'THIRD_PLACE', name: '3rd', emoji: '🥉' },
  { code: 'PLAYOFF_APPEARANCE', name: 'Playoffs', emoji: '🎟️' },
  { code: 'BEST_REGULAR_SEASON', name: 'Best Regular Season', emoji: '📈' },
  { code: 'LAST_PLACE', name: 'Last Place', emoji: '💩' },
];

const GOAT_WEIGHTS = {
  championships: 100,
  runner_ups: 50,
  third_places: 30,
  best_regular_seasons: 25,
  playoff_appearances: 15,
  regular_season_wins: 5,
  seasons_played: 10,
  last_places: -25,
};

function calculateGoatScore(breakdown) {
  const points = {};
  Object.entries(GOAT_WEIGHTS).forEach(([key, weight]) => {
    points[key] = (breakdown[key] || 0) * weight;
  });
  const goatScore = Object.values(points).reduce((total, value) => total + value, 0);
  return { goatScore, points };
}

function number(value) {
  return Number(value || 0);
}

function seasonAwardCodes(row, bestRank, lastRank) {
  const codes = [];
  const totalGames = number(row.wins) + number(row.losses) + number(row.ties);
  const hasPlayed = (row.wins == null && row.losses == null) || totalGames > 0;
  if (row.champion) codes.push('CHAMPIONSHIP');
  if (row.playoff_finish === 2 || (row.playoffs_made && row.regular_season_rank === 2 && !row.champion)) codes.push('RUNNER_UP');
  if (row.playoff_finish === 3 || (row.playoffs_made && row.regular_season_rank === 3 && !row.champion)) codes.push('THIRD_PLACE');
  if (row.playoffs_made && !row.champion && row.playoff_finish !== 2 && row.playoff_finish !== 3 && ![2, 3].includes(row.regular_season_rank)) codes.push('PLAYOFF_APPEARANCE');
  if (hasPlayed && row.regular_season_rank === bestRank) codes.push('BEST_REGULAR_SEASON');
  if (hasPlayed && row.regular_season_rank === lastRank) codes.push('LAST_PLACE');
  return codes;
}

function longestStreak(rows, predicate) {
  let best = { length: 0, start: null, end: null };
  let current = [];
  rows.forEach((row) => {
    if (predicate(row)) {
      if (current.length && row.season_number !== current[current.length - 1].season_number + 1) {
        if (current.length > best.length) best = streakValue(current);
        current = [];
      }
      current.push(row);
      return;
    }
    if (current.length > best.length) best = streakValue(current);
    current = [];
  });
  if (current.length > best.length) best = streakValue(current);
  return best;
}

function streakValue(rows) {
  return {
    length: rows.length,
    start: rows[0].season_number,
    end: rows[rows.length - 1].season_number,
  };
}

function effectivePlayoffFinish(row) {
  if (row.playoff_finish != null) return number(row.playoff_finish);
  if (row.playoffs_made && !row.champion && [2, 3].includes(row.regular_season_rank)) return row.regular_season_rank;
  return row.champion ? 1 : null;
}

function hallOfFameProgress(rows, statistics) {
  const orderedRows = [...rows].sort((left, right) => left.season_number - right.season_number);
  const top3Seasons = [...new Set(orderedRows
    .filter((row) => row.regular_season_rank <= 3 || (effectivePlayoffFinish(row) != null && effectivePlayoffFinish(row) <= 3))
    .map((row) => row.season_id))]
    .map((seasonId) => orderedRows.find((row) => row.season_id === seasonId).season_number)
    .sort((left, right) => left - right);
  let wins = 0;
  const qualifyingTop3Seasons = new Set();
  let inductedYear = null;
  orderedRows.forEach((row, index) => {
    wins += number(row.wins);
    if (row.regular_season_rank <= 3 || (effectivePlayoffFinish(row) != null && effectivePlayoffFinish(row) <= 3)) {
      qualifyingTop3Seasons.add(row.season_id);
    }
    if (inductedYear == null && (index + 1 >= 10 || wins >= 100 || row.champion || qualifyingTop3Seasons.size >= 5)) {
      inductedYear = row.year;
    }
  });
  const requirements = {
    seasons: { current: statistics.seasons, required: 10, complete: statistics.seasons >= 10 },
    wins: { current: statistics.wins, required: 100, complete: statistics.wins >= 100 },
    championships: { current: statistics.championships, required: 1, complete: statistics.championships >= 1 },
    top3Finishes: { current: top3Seasons.length, required: 5, complete: top3Seasons.length >= 5, seasons: top3Seasons },
  };
  return {
    eligible: Object.values(requirements).some((requirement) => requirement.complete),
    inducted_year: inductedYear,
    requirements,
  };
}

function careerAchievements(seasonRows) {
  const rows = [...seasonRows].sort((left, right) => left.season_number - right.season_number);
  const championships = rows.filter((row) => row.champion).length;
  const runnerUps = rows.filter((row) => effectivePlayoffFinish(row) === 2).length;
  const thirdPlaces = rows.filter((row) => effectivePlayoffFinish(row) === 3).length;
  const playoffs = rows.filter((row) => row.playoffs_made).length;
  const bestRegularSeasons = rows.filter((row) => row.regular_season_rank === 1).length;
  const lastPlaces = rows.filter((row) => row.is_last_place).length;
  const wins = rows.reduce((total, row) => total + number(row.wins), 0);
  const losses = rows.reduce((total, row) => total + number(row.losses), 0);
  const gp = wins + losses;
  const finals = championships + runnerUps;
  const bestSeason = [...rows].sort((a, b) => (b.wins - a.wins) || (a.losses - b.losses))[0] || null;
  const worstSeason = [...rows].sort((a, b) => (a.wins - b.wins) || (b.losses - a.losses))[0] || null;
  const mostWins = bestSeason;
  let cumulativeWins = 0;
  let fiftyWinsYear = null;
  let hundredWinsYear = null;
  let playoffAppearances = 0;
  let fivePlayoffsYear = null;
  let tenPlayoffsYear = null;
  rows.forEach((row) => {
    cumulativeWins += number(row.wins);
    if (fiftyWinsYear == null && cumulativeWins >= 50) fiftyWinsYear = row.year;
    if (hundredWinsYear == null && cumulativeWins >= 100) hundredWinsYear = row.year;
    playoffAppearances += row.playoffs_made ? 1 : 0;
    if (fivePlayoffsYear == null && playoffAppearances >= 5) fivePlayoffsYear = row.year;
    if (tenPlayoffsYear == null && playoffAppearances >= 10) tenPlayoffsYear = row.year;
  });
  let biggestImprovement = null;
  let biggestCollapse = null;
  rows.forEach((row, index) => {
    const previous = rows[index - 1];
    if (!previous || row.season_number !== previous.season_number + 1) return;
    const change = row.wins - previous.wins;
    if (change > 0 && (!biggestImprovement || change > biggestImprovement.change)) biggestImprovement = { change, from: previous.season_number, to: row.season_number };
    if (change < 0 && (!biggestCollapse || change < biggestCollapse.change)) biggestCollapse = { change, from: previous.season_number, to: row.season_number };
  });

  const statistics = { seasons: rows.length, gp, wins, losses, winning_percentage: gp ? wins / gp : 0, championships, finals, playoffs, runner_ups: runnerUps, third_places: thirdPlaces, best_regular_seasons: bestRegularSeasons, last_places: lastPlaces };
  return {
    statistics,
    milestones: {
      five_seasons: statistics.seasons >= 5,
      ten_seasons: statistics.seasons >= 10,
      fifty_wins: statistics.wins >= 50,
      hundred_wins: statistics.wins >= 100,
      fifty_wins_year: fiftyWinsYear,
      hundred_wins_year: hundredWinsYear,
      five_playoffs_year: fivePlayoffsYear,
      ten_playoffs_year: tenPlayoffsYear,
    },
    hall_of_fame: hallOfFameProgress(rows, statistics),
    highs: { best_season: bestSeason, worst_season: worstSeason, most_wins: mostWins, biggest_improvement: biggestImprovement, biggest_collapse: biggestCollapse },
    streaks: {
      playoff_streak: longestStreak(rows, (row) => Boolean(row.playoffs_made)),
      championship_streak: longestStreak(rows, (row) => Boolean(row.champion)),
      best_regular_season_streak: longestStreak(rows, (row) => row.regular_season_rank === 1),
      last_place_streak: longestStreak(rows, (row) => row.is_last_place),
      playoff_drought: longestStreak(rows, (row) => !row.playoffs_made),
    },
  };
}

function recalculateAwards(db) {
  const rows = db.prepare(`
    SELECT sr.*, s.season_number, s.year
    FROM season_results sr
    JOIN seasons s ON s.season_id = sr.season_id
    ORDER BY s.season_number ASC, sr.regular_season_rank ASC
  `).all();
  const types = db.prepare('SELECT award_id, code FROM award_types').all();
  const typeIds = {};
  types.forEach((type) => { typeIds[type.code] = type.award_id; });
  const generatedIds = AWARD_TYPES.map((type) => typeIds[type.code]).filter(Boolean);
  const deleteAwards = db.prepare(`DELETE FROM awards WHERE award_id IN (${generatedIds.map(() => '?').join(',')})`);
  const insertAward = db.prepare('INSERT OR IGNORE INTO awards (season_id, manager_id, award_id) VALUES (?, ?, ?)');
  db.transaction(() => {
    deleteAwards.run(...generatedIds);
    const rowsBySeason = new Map();
    rows.forEach((row) => {
      if (!rowsBySeason.has(row.season_id)) rowsBySeason.set(row.season_id, []);
      rowsBySeason.get(row.season_id).push(row);
    });
    rowsBySeason.forEach((seasonRows) => {
      const ranks = seasonRows.map((row) => row.regular_season_rank).filter((rank) => rank != null);
      const bestRank = Math.min(...ranks);
      const lastRank = Math.max(...ranks);
      seasonRows.forEach((row) => seasonAwardCodes(row, bestRank, lastRank).forEach((code) => insertAward.run(row.season_id, row.manager_id, typeIds[code])));
    });
  })();
}

function getTrophyCaseData(db) {
  const managers = db.prepare(`
    SELECT m.manager_id, m.name, m.team_logo, m.team_color_1, m.team_color_2, m.active,
      s.year AS joined_year
    FROM managers m
    LEFT JOIN seasons s ON s.season_id = m.joined_season
    ORDER BY m.name ASC
  `).all();
  const rows = db.prepare(`
    SELECT a.manager_id, at.code AS award_type, at.name AS award_name, s.season_id, s.season_number, s.year,
      sr.wins, sr.losses, sr.regular_season_rank, sr.playoffs_made, sr.playoff_finish, sr.champion
    FROM awards a
    JOIN award_types at ON at.award_id = a.award_id
    JOIN seasons s ON s.season_id = a.season_id
    JOIN season_results sr ON sr.season_id = a.season_id AND sr.manager_id = a.manager_id
    ORDER BY s.season_number DESC, at.award_id ASC
  `).all();
  const seasonRows = db.prepare(`
    SELECT sr.*, s.season_number, s.year
    FROM season_results sr JOIN seasons s ON s.season_id = sr.season_id
    ORDER BY s.season_number ASC
  `).all();
  const seasonMaxRanks = new Map();
  seasonRows.forEach((row) => seasonMaxRanks.set(row.season_id, Math.max(seasonMaxRanks.get(row.season_id) || 0, row.regular_season_rank)));
  seasonRows.forEach((row) => { row.is_last_place = row.regular_season_rank === seasonMaxRanks.get(row.season_id); });
  const cases = managers.map((manager) => {
    const managerAwards = rows.filter((row) => row.manager_id === manager.manager_id);
    const managerSeasons = seasonRows.filter((row) => row.manager_id === manager.manager_id);
    const career = careerAchievements(managerSeasons);
    return { ...manager, championships: managerAwards.filter((award) => award.award_type === 'CHAMPIONSHIP'), season_awards: managerAwards, career }; 
  });
  const championshipLeaders = cases.map((entry) => ({ manager_id: entry.manager_id, name: entry.name, championship_count: entry.career.statistics.championships })).filter((entry) => entry.championship_count > 0).sort((a, b) => b.championship_count - a.championship_count || a.name.localeCompare(b.name));
  return { championshipLeaders, trophyCases: cases, awardTypes: AWARD_TYPES };
}

function getGoatData(db) {
  const trophyCase = getTrophyCaseData(db);
  const rankings = trophyCase.trophyCases.map((entry) => {
    const statistics = entry.career.statistics;
    const awardCount = (code) => entry.season_awards.filter((award) => award.award_type === code).length;
    const breakdown = {
      championships: awardCount('CHAMPIONSHIP'),
      runner_ups: awardCount('RUNNER_UP'),
      third_places: awardCount('THIRD_PLACE'),
      best_regular_seasons: awardCount('BEST_REGULAR_SEASON'),
      playoff_appearances: statistics.playoffs,
      total_playoffs_made: statistics.playoffs,
      regular_season_wins: statistics.wins,
      seasons_played: statistics.seasons,
      last_places: awardCount('LAST_PLACE'),
    };
    const { goatScore, points } = calculateGoatScore(breakdown);
    return { manager_id: entry.manager_id, name: entry.name, team_logo: entry.team_logo, team_color_1: entry.team_color_1, team_color_2: entry.team_color_2, goatScore, breakdown, points };
  }).sort((left, right) => right.goatScore - left.goatScore
    || right.breakdown.championships - left.breakdown.championships
    || right.breakdown.runner_ups - left.breakdown.runner_ups
    || right.breakdown.third_places - left.breakdown.third_places
    || right.breakdown.regular_season_wins - left.breakdown.regular_season_wins
    || right.breakdown.seasons_played - left.breakdown.seasons_played
    || left.name.localeCompare(right.name))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
  return { rankings, weights: GOAT_WEIGHTS };
}

function getCareerTrajectoryData(db, managerId) {
  const manager = db.prepare('SELECT manager_id, name, team_logo, team_color_1, team_color_2 FROM managers WHERE manager_id = ?').get(managerId);
  if (!manager) return null;

  const rows = db.prepare(`
    SELECT sr.*, s.season_number, s.year
    FROM season_results sr
    JOIN seasons s ON s.season_id = sr.season_id
    WHERE sr.manager_id = ?
    ORDER BY s.season_number ASC
  `).all(managerId);
  const seasonRanks = db.prepare('SELECT season_id, MAX(regular_season_rank) AS last_rank FROM season_results GROUP BY season_id').all();
  const lastRankBySeason = new Map(seasonRanks.map((row) => [row.season_id, number(row.last_rank)]));
  const normalizedRows = rows.map((row) => ({
    ...row,
    wins: number(row.wins),
    losses: number(row.losses),
    ties: number(row.ties),
    regular_season_rank: number(row.regular_season_rank),
    playoffs_made: Boolean(row.playoffs_made) || number(row.regular_season_rank) <= 8,
    champion: Boolean(row.champion),
    playoff_finish: row.playoff_finish == null ? null : number(row.playoff_finish),
    is_last_place: number(row.regular_season_rank) === lastRankBySeason.get(row.season_id),
  }));
  const career = careerAchievements(normalizedRows);
  let cumulativeGoatScore = 0;
  const seasons = normalizedRows.map((row) => {
    const playoffFinish = effectivePlayoffFinish(row);
    const hasPlayed = (row.wins + row.losses + row.ties) > 0;
    const seasonBreakdown = {
      championships: row.champion ? 1 : 0,
      runner_ups: playoffFinish === 2 ? 1 : 0,
      third_places: playoffFinish === 3 ? 1 : 0,
      best_regular_seasons: hasPlayed && row.regular_season_rank === 1 ? 1 : 0,
      playoff_appearances: row.playoffs_made ? 1 : 0,
      regular_season_wins: row.wins,
      seasons_played: 1,
      last_places: hasPlayed && row.is_last_place ? 1 : 0,
    };
    const { goatScore: goatPointsEarned } = calculateGoatScore(seasonBreakdown);
    cumulativeGoatScore += goatPointsEarned;
    return {
      season_id: row.season_id,
      season_number: row.season_number,
      year: row.year,
      regular_season_finish: row.regular_season_rank,
      wins: row.wins,
      losses: row.losses,
      ties: row.ties,
      winning_percentage: row.wins + row.losses + row.ties ? row.wins / (row.wins + row.losses + row.ties) : 0,
      playoffs_made: row.playoffs_made,
      playoff_finish: playoffFinish,
      goat_points_earned: goatPointsEarned,
      cumulative_goat_score: cumulativeGoatScore,
    };
  });
  const rankings = getGoatData(db).rankings;
  const goatEntry = rankings.find((entry) => entry.manager_id === manager.manager_id);
  const bestPlayoffFinish = seasons.filter((row) => row.playoff_finish != null).reduce((best, row) => best == null || row.playoff_finish < best ? row.playoff_finish : best, null);

  return {
    manager,
    career_summary: {
      ...career.statistics,
      best_regular_season_finish: normalizedRows.length ? Math.min(...normalizedRows.map((row) => row.regular_season_rank)) : null,
      best_playoff_finish: bestPlayoffFinish,
      goat_rank: goatEntry ? goatEntry.rank : null,
      goat_score: goatEntry ? goatEntry.goatScore : cumulativeGoatScore,
    },
    highlights: career.highs,
    streaks: career.streaks,
    seasons,
  };
}

module.exports = { AWARD_TYPES, GOAT_WEIGHTS, calculateGoatScore, careerAchievements, recalculateAwards, getTrophyCaseData, getGoatData, getCareerTrajectoryData, seasonAwardCodes };