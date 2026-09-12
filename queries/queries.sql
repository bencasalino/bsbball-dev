-- Example queries for the league database

-- 1) Career stats per manager (seasons played, wins, losses, points, win % and awards)
SELECT
  m.manager_id,
  m.name,
  COUNT(sr.season_id) AS seasons_played,
  COALESCE(SUM(sr.wins),0) AS wins,
  COALESCE(SUM(sr.losses),0) AS losses,
  COALESCE(SUM(sr.points_for),0) AS points_for,
  ROUND(CASE WHEN (COALESCE(SUM(sr.wins),0) + COALESCE(SUM(sr.losses),0) + COALESCE(SUM(sr.ties),0)) = 0 THEN 0
       ELSE 1.0 * COALESCE(SUM(sr.wins),0) / (COALESCE(SUM(sr.wins),0) + COALESCE(SUM(sr.losses),0) + COALESCE(SUM(sr.ties),0)) END, 3) AS win_pct,
  (SELECT COUNT(*) FROM awards a WHERE a.manager_id = m.manager_id AND a.award_id = 1) AS championships,
  (SELECT COUNT(*) FROM awards a WHERE a.manager_id = m.manager_id) AS total_awards
FROM managers m
LEFT JOIN season_results sr ON sr.manager_id = m.manager_id
GROUP BY m.manager_id
ORDER BY wins DESC;

-- 2) Most championships (top managers)
SELECT m.name, COUNT(*) AS championships
FROM awards a
JOIN managers m ON m.manager_id = a.manager_id
WHERE a.award_id = 1
GROUP BY a.manager_id
ORDER BY championships DESC;

-- 3) Best single-season record (by wins then points)
SELECT s.season_number, s.year, m.name, sr.wins, sr.losses, sr.points_for
FROM season_results sr
JOIN managers m ON m.manager_id = sr.manager_id
JOIN seasons s ON s.season_id = sr.season_id
ORDER BY sr.wins DESC, sr.points_for DESC
LIMIT 10;

-- 4) Season summary (example: season 20)
SELECT s.season_number, s.year, m.name, sr.wins, sr.losses, sr.points_for, sr.regular_season_rank, sr.playoff_finish
FROM season_results sr
JOIN managers m ON m.manager_id = sr.manager_id
JOIN seasons s ON s.season_id = sr.season_id
WHERE s.season_id = 20
ORDER BY sr.regular_season_rank;
