-- SQLite schema for the league database
PRAGMA foreign_keys = ON;

-- Managers: one row per person who has ever participated
CREATE TABLE IF NOT EXISTS managers (
  manager_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  team_logo TEXT NOT NULL DEFAULT 'fa-solid fa-basketball',
  team_color_1 TEXT NOT NULL DEFAULT '#FFFFFF',
  team_color_2 TEXT NOT NULL DEFAULT '#000000',
  joined_season INTEGER,
  join_order INTEGER,
  legacy_seasons_played INTEGER,
  legacy_games_played INTEGER,
  legacy_wins INTEGER,
  legacy_losses INTEGER,
  legacy_playoff_appearances INTEGER,
  legacy_finals INTEGER,
  legacy_championships INTEGER,
  active INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (joined_season) REFERENCES seasons(season_id)
);

-- Seasons: one row per season
CREATE TABLE IF NOT EXISTS seasons (
  season_id INTEGER PRIMARY KEY,
  season_number INTEGER NOT NULL,
  year INTEGER NOT NULL
);

-- Season Results: one row = one manager's performance in one season
CREATE TABLE IF NOT EXISTS season_results (
  id INTEGER PRIMARY KEY,
  season_id INTEGER NOT NULL,
  manager_id INTEGER NOT NULL,
  manager_display_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  ties INTEGER DEFAULT 0,
  playoffs_made INTEGER NOT NULL DEFAULT 0,
  champion INTEGER NOT NULL DEFAULT 0,
  points_for INTEGER DEFAULT 0,
  points_against INTEGER DEFAULT 0,
  regular_season_rank INTEGER,
  playoff_seed INTEGER,
  playoff_finish INTEGER,
  playoff_wins INTEGER DEFAULT 0,
  playoff_losses INTEGER DEFAULT 0,
  UNIQUE(season_id, manager_id),
  FOREIGN KEY (season_id) REFERENCES seasons(season_id),
  FOREIGN KEY (manager_id) REFERENCES managers(manager_id)
);

-- Award types: e.g., Championship, MVP, Rookie of the Year
CREATE TABLE IF NOT EXISTS award_types (
  award_id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE
);

-- Awards: one row per award given in a season to a manager
CREATE TABLE IF NOT EXISTS awards (
  id INTEGER PRIMARY KEY,
  season_id INTEGER NOT NULL,
  manager_id INTEGER NOT NULL,
  award_id INTEGER NOT NULL,
  FOREIGN KEY (season_id) REFERENCES seasons(season_id),
  FOREIGN KEY (manager_id) REFERENCES managers(manager_id),
  FOREIGN KEY (award_id) REFERENCES award_types(award_id)
);

-- Matchups: Head-to-head weekly game results
CREATE TABLE IF NOT EXISTS matchups (
  id INTEGER PRIMARY KEY,
  season_id INTEGER NOT NULL,
  week INTEGER NOT NULL,
  home_manager_id INTEGER NOT NULL,
  away_manager_id INTEGER NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  winner_manager_id INTEGER NOT NULL,
  is_playoffs INTEGER NOT NULL DEFAULT 0,
  label TEXT,
  FOREIGN KEY (season_id) REFERENCES seasons(season_id),
  FOREIGN KEY (home_manager_id) REFERENCES managers(manager_id),
  FOREIGN KEY (away_manager_id) REFERENCES managers(manager_id),
  FOREIGN KEY (winner_manager_id) REFERENCES managers(manager_id)
);

-- Indexes to speed up common queries
CREATE INDEX IF NOT EXISTS idx_season_results_season ON season_results(season_id);
CREATE INDEX IF NOT EXISTS idx_season_results_manager ON season_results(manager_id);
CREATE INDEX IF NOT EXISTS idx_awards_manager ON awards(manager_id);
CREATE INDEX IF NOT EXISTS idx_matchups_home ON matchups(home_manager_id);
CREATE INDEX IF NOT EXISTS idx_matchups_away ON matchups(away_manager_id);
CREATE INDEX IF NOT EXISTS idx_matchups_season ON matchups(season_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_awards_manager_season_type ON awards(manager_id, season_id, award_id);
