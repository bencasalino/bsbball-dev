const assert = require('node:assert/strict');
const test = require('node:test');
const { calculateGoatScore, careerAchievements, seasonAwardCodes } = require('../server/trophy-case');

test('classifies championship, playoff, best regular season, and last place awards', () => {
  const champion = { champion: 1, playoffs_made: 1, playoff_finish: null, regular_season_rank: 1 };
  const playoff = { champion: 0, playoffs_made: 1, playoff_finish: null, regular_season_rank: 4 };
  const last = { champion: 0, playoffs_made: 0, playoff_finish: null, regular_season_rank: 4, is_last_place: true };
  assert.deepEqual(seasonAwardCodes(champion, 1, 3), ['CHAMPIONSHIP', 'BEST_REGULAR_SEASON']);
  assert.deepEqual(seasonAwardCodes(playoff, 1, 3), ['PLAYOFF_APPEARANCE']);
  assert.deepEqual(seasonAwardCodes(last, 1, 4), ['LAST_PLACE']);
});

test('uses specific playoff finishes instead of generic playoffs', () => {
  assert.deepEqual(seasonAwardCodes({ champion: 0, playoffs_made: 1, playoff_finish: 2, regular_season_rank: 4 }, 1, 5), ['RUNNER_UP']);
  assert.deepEqual(seasonAwardCodes({ champion: 0, playoffs_made: 1, playoff_finish: 3, regular_season_rank: 4 }, 1, 5), ['THIRD_PLACE']);
});

test('creates a Runner-Up award from Finish 2 without overriding an official champion', () => {
  assert.deepEqual(seasonAwardCodes({ champion: 0, playoffs_made: 1, playoff_finish: null, regular_season_rank: 2 }, 1, 8), ['RUNNER_UP']);
  assert.equal(seasonAwardCodes({ champion: 1, playoffs_made: 1, playoff_finish: null, regular_season_rank: 2 }, 1, 8).includes('RUNNER_UP'), false);
});

test('creates a Third Place award from Finish 3 without adding generic playoffs', () => {
  assert.deepEqual(seasonAwardCodes({ champion: 0, playoffs_made: 1, playoff_finish: null, regular_season_rank: 3 }, 1, 8), ['THIRD_PLACE']);
  assert.equal(seasonAwardCodes({ champion: 1, playoffs_made: 1, playoff_finish: null, regular_season_rank: 3 }, 1, 8).includes('THIRD_PLACE'), false);
});

test('calculates career totals and finals from championships plus runner-ups', () => {
  const result = careerAchievements([
    { season_number: 1, wins: 10, losses: 4, playoffs_made: 1, champion: 1, playoff_finish: null, regular_season_rank: 1 },
    { season_number: 2, wins: 8, losses: 6, playoffs_made: 1, champion: 0, playoff_finish: 2, regular_season_rank: 2 },
    { season_number: 3, wins: 3, losses: 11, playoffs_made: 0, champion: 0, playoff_finish: null, regular_season_rank: 4, is_last_place: true },
  ]);
  assert.deepEqual(result.statistics, {
    seasons: 3, gp: 42, wins: 21, losses: 21, winning_percentage: 0.5,
    championships: 1, finals: 2, playoffs: 2, runner_ups: 1, third_places: 0,
    best_regular_seasons: 1, last_places: 1,
  });
  assert.equal(result.streaks.playoff_streak.length, 2);
  assert.equal(result.streaks.playoff_drought.length, 1);
});

test('does not bridge playoff droughts across non-participation gaps', () => {
  const result = careerAchievements([
    { season_number: 1, wins: 4, losses: 10, playoffs_made: 0, champion: 0, regular_season_rank: 5, is_last_place: true },
    { season_number: 3, wins: 5, losses: 9, playoffs_made: 0, champion: 0, regular_season_rank: 4, is_last_place: true },
    { season_number: 4, wins: 8, losses: 6, playoffs_made: 1, champion: 0, regular_season_rank: 2, is_last_place: false },
  ]);
  assert.equal(result.streaks.playoff_drought.length, 1);
});

test('calculates consecutive improvements and collapses only across adjacent seasons', () => {
  const result = careerAchievements([
    { season_number: 1, wins: 4, losses: 10, playoffs_made: 0, champion: 0, regular_season_rank: 4 },
    { season_number: 2, wins: 11, losses: 3, playoffs_made: 1, champion: 0, regular_season_rank: 1 },
    { season_number: 3, wins: 3, losses: 11, playoffs_made: 0, champion: 0, regular_season_rank: 5 },
  ]);
  assert.deepEqual(result.highs.biggest_improvement, { change: 7, from: 1, to: 2 });
  assert.deepEqual(result.highs.biggest_collapse, { change: -8, from: 2, to: 3 });
});

test('Hall of Fame eligibility uses OR logic and deduplicates Top-3 qualifying seasons', () => {
  const seasons = Array.from({ length: 5 }, (_, index) => ({
    season_id: index + 1,
    season_number: index + 1,
    wins: 8,
    losses: 6,
    playoffs_made: index < 2 ? 1 : 0,
    champion: index === 0 ? 1 : 0,
    playoff_finish: index === 1 ? 2 : null,
    regular_season_rank: index < 3 ? 2 : 5,
    is_last_place: false,
  }));
  const result = careerAchievements(seasons);
  assert.equal(result.hall_of_fame.requirements.seasons.current, 5);
  assert.equal(result.hall_of_fame.requirements.wins.current, 40);
  assert.equal(result.hall_of_fame.requirements.championships.complete, true);
  assert.equal(result.hall_of_fame.requirements.top3Finishes.current, 3);
  assert.equal(result.hall_of_fame.eligible, true);
});

test('five unique Top-3 seasons qualify without double-counting regular and playoff Top-3 results', () => {
  const seasons = Array.from({ length: 5 }, (_, index) => ({
    season_id: index + 1,
    season_number: index + 1,
    wins: 4,
    losses: 10,
    playoffs_made: 1,
    champion: 0,
    playoff_finish: index === 4 ? 2 : null,
    regular_season_rank: index < 4 ? 1 : 4,
    is_last_place: false,
  }));
  const result = careerAchievements(seasons);
  assert.equal(result.hall_of_fame.requirements.top3Finishes.current, 5);
  assert.equal(result.hall_of_fame.eligible, true);
});

test('records the first season in which any Hall of Fame requirement is completed', () => {
  const seasons = [
    { season_id: 1, season_number: 1, year: 2010, wins: 4, losses: 10, playoffs_made: 0, champion: 0, playoff_finish: null, regular_season_rank: 5, is_last_place: false },
    { season_id: 2, season_number: 2, year: 2011, wins: 8, losses: 6, playoffs_made: 1, champion: 1, playoff_finish: null, regular_season_rank: 2, is_last_place: false },
  ];
  const result = careerAchievements(seasons);
  assert.equal(result.hall_of_fame.inducted_year, 2011);
});

test('records the first seasons for 50 and 100 cumulative career wins', () => {
  const seasons = [
    { season_id: 1, season_number: 1, year: 2010, wins: 30, losses: 2, playoffs_made: 0, champion: 0, playoff_finish: null, regular_season_rank: 4, is_last_place: false },
    { season_id: 2, season_number: 2, year: 2011, wins: 25, losses: 7, playoffs_made: 0, champion: 0, playoff_finish: null, regular_season_rank: 4, is_last_place: false },
    { season_id: 3, season_number: 3, year: 2012, wins: 50, losses: 0, playoffs_made: 0, champion: 0, playoff_finish: null, regular_season_rank: 4, is_last_place: false },
  ];
  const result = careerAchievements(seasons);
  assert.equal(result.milestones.fifty_wins_year, 2011);
  assert.equal(result.milestones.hundred_wins_year, 2012);
});

test('calculates GOAT score from the official weighted breakdown', () => {
  const result = calculateGoatScore({ championships: 2, runner_ups: 1, third_places: 1, best_regular_seasons: 2, playoff_appearances: 3, regular_season_wins: 40, seasons_played: 7, last_places: 1 });
  assert.equal(result.goatScore, 620);
  assert.equal(result.points.championships, 200);
  assert.equal(result.points.seasons_played, 70);
  assert.equal(result.points.last_places, -25);
});