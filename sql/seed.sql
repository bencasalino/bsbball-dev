-- Seed data: example managers, seasons, results, award types and awards
BEGIN TRANSACTION;

-- Seasons 1..20 (season_id == season_number for simplicity)
INSERT INTO seasons (season_id, season_number, year) VALUES
(1, 1, 2007),
(2, 2, 2008),
(3, 3, 2009),
(4, 4, 2010),
(5, 5, 2011),
(6, 6, 2012),
(7, 7, 2013),
(8, 8, 2014),
(9, 9, 2015),
(10, 10, 2016),
(11, 11, 2017),
(12, 12, 2018),
(13, 13, 2019),
(14, 14, 2020),
(15, 15, 2021),
(16, 16, 2022),
(17, 17, 2023),
(18, 18, 2024),
(19, 19, 2025),
(20, 20, 2026);

-- Managers
INSERT INTO managers (
	manager_id,
	name,
	joined_season,
	join_order,
	active,
	legacy_seasons_played,
	legacy_wins,
	legacy_losses,
	legacy_playoff_appearances,
	legacy_finals,
	legacy_championships
) VALUES
(4, 'Jon H', 1, 2, 1, 17, 171, 95, 15, 5, 3),
(5, 'Rafa S', 3, 13, 1, 15, 139, 89, 13, 4, 3),
(6, 'Ben C', 1, 1, 1, 17, 162, 102, 14, 5, 2),
(7, 'Adam B', 7, 28, 1, 11, 131, 46, 9, 6, 2),
(8, 'Kyle K', 10, 42, 1, 5, 34, 54, 3, 0, 0),
(9, 'Scott B', 12, 49, 1, 6, 7, 79, 0, 0, 0),
(10, 'Lee T', 16, 59, 1, 2, 8, 10, 1, 1, 0),
(11, 'Alex M', 16, 57, 1, 2, 14, 4, 1, 0, 0),
(12, 'Rob R', 17, 60, 1, 1, 0, 0, 0, 0, 0),
(13, 'Jose Q', 17, 61, 1, 1, 0, 0, 0, 0, 0),
(14, 'Burges M', 9, 37, 0, 7, 80, 38, 7, 5, 2),
(15, 'Zach Z', 1, 3, 0, 6, 72, 21, 5, 1, 1),
(16, 'Kristen M', 6, 20, 0, 1, 12, 1, 1, 1, 1),
(17, 'Adrian F', 13, 51, 0, 3, 41, 9, 3, 2, 1),
(18, 'Connor F', 12, 46, 0, 4, 33, 35, 3, 1, 1),
(19, 'Pete R', 16, 55, 0, 1, 1, 17, 0, 0, 0),
(20, 'Dakota D', 16, 58, 0, 1, 8, 10, 1, 0, 0),
(21, 'Brendan I', 16, 56, 0, 1, 10, 8, 1, 0, 0),
(22, 'Tyler H', 16, 54, 0, 1, 11, 7, 1, 0, 0),
(23, 'Chris L', 8, 31, 0, 8, 63, 70, 5, 0, 0),
(24, 'Lamar R', 5, 19, 0, 6, 29, 64, 2, 0, 0),
(25, 'Tanner L', 9, 41, 0, 3, 26, 22, 2, 1, 0),
(26, 'Tophas A', 12, 50, 0, 5, 40, 46, 3, 1, 0),
(27, 'Carlo S', 3, 9, 0, 5, 30, 44, 2, 0, 0),
(28, 'Yacine B', 1, 4, 0, 3, 33, 20, 3, 0, 0),
(29, 'Ryan Z', 1, 8, 0, 3, 20, 34, 1, 0, 0),
(30, 'Rudy V', 4, 18, 0, 3, 18, 24, 2, 0, 0),
(31, 'Josh M', 5, 21, 0, 3, 12, 33, 1, 0, 0),
(32, 'Jordan F', 1, 7, 0, 3, 25, 29, 2, 0, 0),
(33, 'Jordan E', 1, 6, 0, 4, 22, 46, 1, 0, 0),
(34, 'Danny R', 3, 10, 0, 3, 14, 31, 1, 0, 0),
(35, 'Craig L', 9, 38, 0, 3, 32, 18, 3, 0, 0),
(36, 'Brady L', 1, 5, 0, 4, 38, 31, 3, 0, 0),
(37, 'Edde V', 4, 15, 0, 2, 12, 12, 1, 0, 0),
(38, 'James V', 7, 27, 0, 2, 12, 20, 0, 0, 0),
(39, 'Jason B', 12, 47, 0, 2, 13, 23, 0, 0, 0),
(40, 'Ryan C', 9, 41, 0, 2, 10, 24, 0, 0, 0),
(41, 'Zach L', 8, 36, 0, 1, 4, 10, 0, 0, 0),
(42, 'Sean W', 9, 43, 0, 1, 9, 7, 1, 0, 0),
(43, 'Scott M', 8, 35, 0, 1, 9, 6, 1, 0, 0),
(44, 'Robert L', 13, 53, 0, 1, 10, 8, 1, 0, 0),
(45, 'Robbie B', 7, 29, 0, 1, 3, 14, 0, 0, 0),
(46, 'Preet G', 12, 48, 0, 1, 2, 16, 0, 0, 0),
(47, 'Paul R', 6, 26, 0, 1, 4, 12, 0, 0, 0),
(48, 'Myles S', 3, 14, 0, 1, 10, 8, 1, 0, 0),
(49, 'Matt S', 6, 24, 0, 1, 9, 7, 1, 1, 0),
(50, 'Mateo E', 9, 40, 0, 1, 4, 12, 0, 0, 0),
(51, 'Mark D', 8, 34, 0, 1, 9, 6, 1, 0, 0),
(52, 'Marcco P', 5, 22, 0, 1, 1, 11, 0, 0, 0),
(53, 'Langston Q', 6, 25, 0, 1, 7, 9, 0, 0, 0),
(54, 'Kenny W', 6, 23, 0, 1, 11, 5, 1, 0, 0),
(55, 'Justin B', 4, 17, 0, 1, 5, 11, 0, 0, 0),
(56, 'Jordan M', 3, 12, 0, 1, 10, 8, 1, 0, 0),
(57, 'Jesus Z', 8, 33, 0, 1, 8, 7, 0, 0, 0),
(58, 'Jess S', 8, 32, 0, 1, 7, 8, 1, 0, 0),
(59, 'Jeremy H', 11, 45, 0, 1, 2, 16, 0, 0, 0),
(60, 'James C', 9, 39, 0, 1, 4, 12, 0, 0, 0),
(61, 'Gary Q', 3, 11, 0, 1, 4, 12, 0, 0, 0),
(62, 'Chad D', 4, 16, 0, 1, 1, 11, 0, 0, 0),
(63, 'Andy M', 8, 30, 0, 1, 1, 13, 0, 0, 0),
(64, 'Adam S', 13, 52, 0, 1, 5, 13, 1, 1, 0),
(65, 'A.J. P', 4, 14, 0, 1, 8, 4, 1, 0, 0);

-- Randomized team branding assignments
UPDATE managers SET team_logo = 'fa-solid fa-basketball', team_color_1 = '#E63946', team_color_2 = '#1D3557' WHERE manager_id = 1;
UPDATE managers SET team_logo = 'fa-solid fa-shield-halved', team_color_1 = '#F4A261', team_color_2 = '#264653' WHERE manager_id = 2;
UPDATE managers SET team_logo = 'fa-solid fa-bolt', team_color_1 = '#2A9D8F', team_color_2 = '#E9C46A' WHERE manager_id = 3;
UPDATE managers SET team_logo = 'fa-solid fa-crown', team_color_1 = '#9B5DE5', team_color_2 = '#FEE440' WHERE manager_id = 4;
UPDATE managers SET team_logo = 'fa-solid fa-star', team_color_1 = '#FF595E', team_color_2 = '#1982C4' WHERE manager_id = 5;
UPDATE managers SET team_logo = 'fa-solid fa-fire', team_color_1 = '#FF6B35', team_color_2 = '#004E64' WHERE manager_id = 6;
UPDATE managers SET team_logo = 'fa-solid fa-fan', team_color_1 = '#1D1160', team_color_2 = '#E56020' WHERE manager_id = 7;
UPDATE managers SET team_logo = 'fa-solid fa-dragon', team_color_1 = '#D7263D', team_color_2 = '#02111B' WHERE manager_id = 8;
UPDATE managers SET team_logo = 'fa-solid fa-feather', team_color_1 = '#00A6A6', team_color_2 = '#F5E663' WHERE manager_id = 9;
UPDATE managers SET team_logo = 'fa-solid fa-rocket', team_color_1 = '#8338EC', team_color_2 = '#FFBE0B' WHERE manager_id = 10;
UPDATE managers SET team_logo = 'fa-solid fa-gem', team_color_1 = '#3A86FF', team_color_2 = '#FF006E' WHERE manager_id = 11;
UPDATE managers SET team_logo = 'fa-solid fa-tree', team_color_1 = '#588157', team_color_2 = '#DAD7CD' WHERE manager_id = 12;
UPDATE managers SET team_logo = 'fa-solid fa-sun', team_color_1 = '#FF9F1C', team_color_2 = '#2EC4B6' WHERE manager_id = 13;
UPDATE managers SET team_logo = 'fa-solid fa-moon', team_color_1 = '#5E60CE', team_color_2 = '#80FFDB' WHERE manager_id = 14;
UPDATE managers SET team_logo = 'fa-solid fa-anchor', team_color_1 = '#0077B6', team_color_2 = '#FCA311' WHERE manager_id = 15;
UPDATE managers SET team_logo = 'fa-solid fa-compass', team_color_1 = '#C1121F', team_color_2 = '#FDF0D5' WHERE manager_id = 16;
UPDATE managers SET team_logo = 'fa-solid fa-wand-magic-sparkles', team_color_1 = '#7400B8', team_color_2 = '#80FFDB' WHERE manager_id = 17;
UPDATE managers SET team_logo = 'fa-solid fa-frog', team_color_1 = '#70E000', team_color_2 = '#240046' WHERE manager_id = 18;
UPDATE managers SET team_logo = 'fa-solid fa-paw', team_color_1 = '#B56576', team_color_2 = '#355070' WHERE manager_id = 19;
UPDATE managers SET team_logo = 'fa-solid fa-ghost', team_color_1 = '#F72585', team_color_2 = '#4361EE' WHERE manager_id = 20;
UPDATE managers SET team_logo = 'fa-solid fa-hat-wizard', team_color_1 = '#FB5607', team_color_2 = '#3A0CA3' WHERE manager_id = 21;
UPDATE managers SET team_logo = 'fa-solid fa-skull-crossbones', team_color_1 = '#D00000', team_color_2 = '#FFBA08' WHERE manager_id = 22;
UPDATE managers SET team_logo = 'fa-solid fa-hand-fist', team_color_1 = '#6F1D1B', team_color_2 = '#BB9457' WHERE manager_id = 23;
UPDATE managers SET team_logo = 'fa-solid fa-heart', team_color_1 = '#E63946', team_color_2 = '#457B9D' WHERE manager_id = 24;
UPDATE managers SET team_logo = 'fa-solid fa-flag', team_color_1 = '#780000', team_color_2 = '#669BBC' WHERE manager_id = 25;
UPDATE managers SET team_logo = 'fa-solid fa-puzzle-piece', team_color_1 = '#FF7F11', team_color_2 = '#011627' WHERE manager_id = 26;
UPDATE managers SET team_logo = 'fa-solid fa-clover', team_color_1 = '#386641', team_color_2 = '#F2E8CF' WHERE manager_id = 27;
UPDATE managers SET team_logo = 'fa-solid fa-certificate', team_color_1 = '#D4A373', team_color_2 = '#283618' WHERE manager_id = 28;
UPDATE managers SET team_logo = 'fa-solid fa-chess-knight', team_color_1 = '#8338EC', team_color_2 = '#06D6A0' WHERE manager_id = 29;
UPDATE managers SET team_logo = 'fa-solid fa-mask', team_color_1 = '#2B2D42', team_color_2 = '#EF233C' WHERE manager_id = 30;
UPDATE managers SET team_logo = 'fa-solid fa-umbrella', team_color_1 = '#118AB2', team_color_2 = '#FFD166' WHERE manager_id = 31;
UPDATE managers SET team_logo = 'fa-solid fa-apple-whole', team_color_1 = '#C1121F', team_color_2 = '#669BBC' WHERE manager_id = 32;
UPDATE managers SET team_logo = 'fa-solid fa-leaf', team_color_1 = '#2D6A4F', team_color_2 = '#B7E4C7' WHERE manager_id = 33;
UPDATE managers SET team_logo = 'fa-solid fa-snowflake', team_color_1 = '#48CAE4', team_color_2 = '#03045E' WHERE manager_id = 34;
UPDATE managers SET team_logo = 'fa-solid fa-volleyball', team_color_1 = '#F15BB5', team_color_2 = '#00BBF9' WHERE manager_id = 35;
UPDATE managers SET team_logo = 'fa-solid fa-dice', team_color_1 = '#6D597A', team_color_2 = '#B56576' WHERE manager_id = 36;
UPDATE managers SET team_logo = 'fa-solid fa-guitar', team_color_1 = '#9A031E', team_color_2 = '#FB8B24' WHERE manager_id = 37;
UPDATE managers SET team_logo = 'fa-solid fa-microphone', team_color_1 = '#5F0F40', team_color_2 = '#E36414' WHERE manager_id = 38;
UPDATE managers SET team_logo = 'fa-solid fa-gamepad', team_color_1 = '#3F37C9', team_color_2 = '#4CC9F0' WHERE manager_id = 39;
UPDATE managers SET team_logo = 'fa-solid fa-bicycle', team_color_1 = '#22577A', team_color_2 = '#80ED99' WHERE manager_id = 40;
UPDATE managers SET team_logo = 'fa-solid fa-car', team_color_1 = '#F94144', team_color_2 = '#577590' WHERE manager_id = 41;
UPDATE managers SET team_logo = 'fa-solid fa-plane', team_color_1 = '#277DA1', team_color_2 = '#F9C74F' WHERE manager_id = 42;
UPDATE managers SET team_logo = 'fa-solid fa-ship', team_color_1 = '#023047', team_color_2 = '#FFB703' WHERE manager_id = 43;
UPDATE managers SET team_logo = 'fa-solid fa-truck', team_color_1 = '#6A994E', team_color_2 = '#BC4749' WHERE manager_id = 44;
UPDATE managers SET team_logo = 'fa-solid fa-horse', team_color_1 = '#7F5539', team_color_2 = '#EDE0D4' WHERE manager_id = 45;
UPDATE managers SET team_logo = 'fa-solid fa-cat', team_color_1 = '#FFAFCC', team_color_2 = '#590D22' WHERE manager_id = 46;
UPDATE managers SET team_logo = 'fa-solid fa-dog', team_color_1 = '#A44A3F', team_color_2 = '#F0F3BD' WHERE manager_id = 47;
UPDATE managers SET team_logo = 'fa-solid fa-fish', team_color_1 = '#0077B6', team_color_2 = '#90E0EF' WHERE manager_id = 48;
UPDATE managers SET team_logo = 'fa-solid fa-bug', team_color_1 = '#606C38', team_color_2 = '#FEFAE0' WHERE manager_id = 49;
UPDATE managers SET team_logo = 'fa-solid fa-spider', team_color_1 = '#212529', team_color_2 = '#E63946' WHERE manager_id = 50;
UPDATE managers SET team_logo = 'fa-solid fa-wifi', team_color_1 = '#FF006E', team_color_2 = '#8338EC' WHERE manager_id = 51;
UPDATE managers SET team_logo = 'fa-solid fa-camera', team_color_1 = '#495057', team_color_2 = '#F8F9FA' WHERE manager_id = 52;
UPDATE managers SET team_logo = 'fa-solid fa-paw', team_color_1 = '#3D405B', team_color_2 = '#F28482' WHERE manager_id = 53;
UPDATE managers SET team_logo = 'fa-solid fa-bell', team_color_1 = '#F77F00', team_color_2 = '#003049' WHERE manager_id = 54;
UPDATE managers SET team_logo = 'fa-solid fa-key', team_color_1 = '#FFD60A', team_color_2 = '#001D3D' WHERE manager_id = 55;
UPDATE managers SET team_logo = 'fa-solid fa-lock', team_color_1 = '#606C38', team_color_2 = '#283618' WHERE manager_id = 56;
UPDATE managers SET team_logo = 'fa-solid fa-eye', team_color_1 = '#00B4D8', team_color_2 = '#03045E' WHERE manager_id = 57;
UPDATE managers SET team_logo = 'fa-solid fa-handshake', team_color_1 = '#A7C957', team_color_2 = '#386641' WHERE manager_id = 58;
UPDATE managers SET team_logo = 'fa-solid fa-flag-checkered', team_color_1 = '#D00000', team_color_2 = '#000000' WHERE manager_id = 59;
UPDATE managers SET team_logo = 'fa-solid fa-medal', team_color_1 = '#D4AF37', team_color_2 = '#6B4226' WHERE manager_id = 60;
UPDATE managers SET team_logo = 'fa-solid fa-trophy', team_color_1 = '#FFD700', team_color_2 = '#8B4513' WHERE manager_id = 61;
UPDATE managers SET team_logo = 'fa-solid fa-ranking-star', team_color_1 = '#FFCA3A', team_color_2 = '#1982C4' WHERE manager_id = 62;
UPDATE managers SET team_logo = 'fa-solid fa-chart-line', team_color_1 = '#06D6A0', team_color_2 = '#073B4C' WHERE manager_id = 63;
UPDATE managers SET team_logo = 'fa-solid fa-chart-pie', team_color_1 = '#F15BB5', team_color_2 = '#00F5D4' WHERE manager_id = 64;
UPDATE managers SET team_logo = 'fa-solid fa-people-group', team_color_1 = '#8ECAE6', team_color_2 = '#023047' WHERE manager_id = 65;

-- Exact legacy games played from old-table.html
UPDATE managers SET legacy_games_played = 266 WHERE name = 'Jon H';
UPDATE managers SET legacy_games_played = 228 WHERE name = 'Rafa S';
UPDATE managers SET legacy_games_played = 264 WHERE name = 'Ben C';
UPDATE managers SET legacy_games_played = 177 WHERE name = 'Adam B';
UPDATE managers SET legacy_games_played = 88 WHERE name = 'Kyle K';
UPDATE managers SET legacy_games_played = 86 WHERE name = 'Scott B';
UPDATE managers SET legacy_games_played = 18 WHERE name = 'Lee T';
UPDATE managers SET legacy_games_played = 18 WHERE name = 'Alex M';
UPDATE managers SET legacy_games_played = 0 WHERE name = 'Rob R';
UPDATE managers SET legacy_games_played = 0 WHERE name = 'Jose Q';
UPDATE managers SET legacy_games_played = 118 WHERE name = 'Burges M';
UPDATE managers SET legacy_games_played = 93 WHERE name = 'Zach Z';
UPDATE managers SET legacy_games_played = 13 WHERE name = 'Kristen M';
UPDATE managers SET legacy_games_played = 50 WHERE name = 'Adrian F';
UPDATE managers SET legacy_games_played = 68 WHERE name = 'Connor F';
UPDATE managers SET legacy_games_played = 18 WHERE name = 'Pete R';
UPDATE managers SET legacy_games_played = 18 WHERE name = 'Dakota D';
UPDATE managers SET legacy_games_played = 18 WHERE name = 'Brendan I';
UPDATE managers SET legacy_games_played = 18 WHERE name = 'Tyler H';
UPDATE managers SET legacy_games_played = 133 WHERE name = 'Chris L';
UPDATE managers SET legacy_games_played = 93 WHERE name = 'Lamar R';
UPDATE managers SET legacy_games_played = 48 WHERE name = 'Tanner L';
UPDATE managers SET legacy_games_played = 86 WHERE name = 'Tophas A';
UPDATE managers SET legacy_games_played = 74 WHERE name = 'Carlo S';
UPDATE managers SET legacy_games_played = 53 WHERE name = 'Yacine B';
UPDATE managers SET legacy_games_played = 54 WHERE name = 'Ryan Z';
UPDATE managers SET legacy_games_played = 42 WHERE name = 'Rudy V';
UPDATE managers SET legacy_games_played = 45 WHERE name = 'Josh M';
UPDATE managers SET legacy_games_played = 54 WHERE name = 'Jordan F';
UPDATE managers SET legacy_games_played = 68 WHERE name = 'Jordan E';
UPDATE managers SET legacy_games_played = 45 WHERE name = 'Danny R';
UPDATE managers SET legacy_games_played = 50 WHERE name = 'Craig L';
UPDATE managers SET legacy_games_played = 69 WHERE name = 'Brady L';
UPDATE managers SET legacy_games_played = 24 WHERE name = 'Edde V';
UPDATE managers SET legacy_games_played = 32 WHERE name = 'James V';
UPDATE managers SET legacy_games_played = 36 WHERE name = 'Jason B';
UPDATE managers SET legacy_games_played = 34 WHERE name = 'Ryan C';
UPDATE managers SET legacy_games_played = 14 WHERE name = 'Zach L';
UPDATE managers SET legacy_games_played = 16 WHERE name = 'Sean W';
UPDATE managers SET legacy_games_played = 15 WHERE name = 'Scott M';
UPDATE managers SET legacy_games_played = 18 WHERE name = 'Robert L';
UPDATE managers SET legacy_games_played = 17 WHERE name = 'Robbie B';
UPDATE managers SET legacy_games_played = 18 WHERE name = 'Preet G';
UPDATE managers SET legacy_games_played = 18 WHERE name = 'Paul R';
UPDATE managers SET legacy_games_played = 18 WHERE name = 'Myles S';
UPDATE managers SET legacy_games_played = 16 WHERE name = 'Matt S';
UPDATE managers SET legacy_games_played = 16 WHERE name = 'Mateo E';
UPDATE managers SET legacy_games_played = 15 WHERE name = 'Mark D';
UPDATE managers SET legacy_games_played = 12 WHERE name = 'Marcco P';
UPDATE managers SET legacy_games_played = 16 WHERE name = 'Langston Q';
UPDATE managers SET legacy_games_played = 16 WHERE name = 'Kenny W';
UPDATE managers SET legacy_games_played = 16 WHERE name = 'Justin B';
UPDATE managers SET legacy_games_played = 18 WHERE name = 'Jordan M';
UPDATE managers SET legacy_games_played = 15 WHERE name = 'Jesus Z';
UPDATE managers SET legacy_games_played = 15 WHERE name = 'Jess S';
UPDATE managers SET legacy_games_played = 18 WHERE name = 'Jeremy H';
UPDATE managers SET legacy_games_played = 16 WHERE name = 'James C';
UPDATE managers SET legacy_games_played = 16 WHERE name = 'Gary Q';
UPDATE managers SET legacy_games_played = 12 WHERE name = 'Chad D';
UPDATE managers SET legacy_games_played = 14 WHERE name = 'Andy M';
UPDATE managers SET legacy_games_played = 18 WHERE name = 'Adam S';
UPDATE managers SET legacy_games_played = 12 WHERE name = 'A.J. P';

-- Sample Season Results (season 20 as example)
INSERT INTO season_results (season_id, manager_id, wins, losses, points_for, regular_season_rank, playoff_finish) VALUES
(20, 1, 11, 3, 1823, 2, 2),
(20, 2, 13, 1, 1942, 1, 1),
(20, 3, 7, 7, 1602, 8, 8);

-- Award types
INSERT INTO award_types (award_id, name) VALUES
(1, 'Championship'),
(2, 'MVP'),
(3, 'Best Regular Season'),
(4, 'Rookie of the Year'),
(5, 'Most Improved');

-- Example awards for season 20
-- Championship -> Mike (manager_id=2)
INSERT INTO awards (season_id, manager_id, award_id) VALUES
(20, 2, 1),
-- Best Regular Season -> Mike
(20, 2, 3),
-- MVP -> Ben
(20, 1, 2);

COMMIT;
