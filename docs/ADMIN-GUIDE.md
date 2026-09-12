# BS Basketball League — Owner & Admin Operating Manual

Welcome to the official **Owner & Admin Operating Manual** for the BS Basketball League website (`bsbasketball.net`). 

This manual is written for you as the league commissioner and owner of the website. It explains in plain, non-technical language how your website works under the hood, how all league data is structured, and step-by-step instructions for managing teams, managers, logos, colors, seasons, historical records, and site deployments.

---

## Table of Contents
1. [Overview & How the Application Works](#1-overview--how-the-application-works)
2. [Admin & Website Operation](#2-admin--website-operation)
3. [Database Map](#3-database-map)
4. [Team Management](#4-team-management)
5. [Manager Management](#5-manager-management)
6. [Team Logos & Images](#6-team-logos--images)
7. [Colors & Branding](#7-colors--branding)
8. [Seasons & Season Management](#8-seasons--season-management)
9. [Historical Data Rules](#9-historical-data-rules)
10. [Updating & Deploying Changes to the Live Website](#10-updating--deploying-changes-to-the-live-website)

---

## 1. Overview & How the Application Works

Your website is a modern, lightweight web application built with **Node.js, Express, and SQLite** (`data/league.db`). 

- **Frontend**: Single-page application (`index.html`, `js/app.js`, `css/styles.css`) rendering navigation and views directly in the browser.
- **Backend API**: Express server (`server/index.js` and `server/trophy-case.js`) serving REST endpoints (`/api/*`) for leaders, seasons, trophy cases, Hall of Fame, Record Book, GOAT rankings, and career trajectories.
- **Database**: SQLite database stored locally in `data/league.db`.
- **Import / Source Pipeline**: `canonical-import.js` and `init-db.js` hold the complete historical league dataset and rebuild `data/league.db` automatically when needed.

---

## 2. Admin & Website Operation

> **NO ADMIN UI CURRENTLY EXISTS ON THE WEBSITE**

The public website at `bsbasketball.net` is **100% read-only** for visitors and league members. There are no login screens, admin dashboards, or edit buttons in the browser UI.

### How You Perform Administrative Tasks:
All management operations (editing managers, updating team names, changing colors, entering new season results) are done in one of two ways:

1. **Option A (Recommended — Source of Truth)**: Edit the dataset file `canonical-import.js` in your project folder, run `npm run init-db` locally to rebuild `data/league.db`, and push the update to GitHub. (When pushed, Namecheap cPanel pulls the updated repository and database).
2. **Option B (Direct Database Edit)**: Connect directly to `data/league.db` using an SQLite editor tool (like DB Browser for SQLite or cPanel's File Manager / SQLite extension) and execute SQL statements.

---

## 3. Database Map

The database (`data/league.db`) consists of **5 primary tables**. Below is a practical map of what each table stores and how they connect to one another.

```
┌──────────────┐       ┌─────────────────┐       ┌──────────────┐
│   managers   │1─────N│ season_results  │N─────1│   seasons    │
└──────────────┘       └─────────────────┘       └──────────────┘
       │                        │                       │
       │1                       │                       │1
       │                        │                       │
       ▼N                       │                       ▼N
┌──────────────┐                │                ┌──────────────┐
│    awards    │────────────────┴───────────────►│ award_types  │
└──────────────┘                                 └──────────────┘
```

### Table 1: `managers`
Stores every manager/owner who has ever participated in the league.
- **`manager_id`** *(Primary Key)*: Unique numeric ID assigned to the manager (e.g., Ben = 2, Jon = 7). **NEVER CHANGE THIS ID.**
- **`name`**: The manager's full canonical display name (e.g. `"Ben Casalino"`).
- **`team_logo`**: Font Awesome 6 icon class string representing their primary team icon (e.g. `"fa-solid fa-mountain"`).
- **`team_color_1`**: Primary brand color in HEX format (e.g. `"#C39E6D"`).
- **`team_color_2`**: Secondary brand color in HEX format (e.g. `"#275ED4"`).
- **`joined_season`**: The season ID when this manager first entered the league.
- **`active`**: `1` if the manager is active for the upcoming season, `0` if inactive.

### Table 2: `seasons`
Stores each season's metadata.
- **`season_id`** *(Primary Key)*: Unique numeric ID for the season (1, 2, 3... 20).
- **`season_number`**: The sequential season number (e.g., 19, 20).
- **`year`**: The ending/championship calendar year (e.g. 2026 for Season 19, 2027 for Season 20).

### Table 3: `season_results`
Stores a manager's performance record for one specific season. **One row = one manager in one season.**
- **`id`** *(Primary Key)*: Unique record ID.
- **`season_id`** *(Foreign Key → `seasons.season_id`)*: Linked season.
- **`manager_id`** *(Foreign Key → `managers.manager_id`)*: Linked manager.
- **`manager_display_name`**: Name used by the manager in that season.
- **`team_name`**: The exact fantasy team name used in that specific season (e.g. `"Barles Charkley"`).
- **`wins`**, **`losses`**, **`ties`**: Regular-season match record.
- **`regular_season_rank`**: Finishing rank in regular season standings (1 = 1st Place).
- **`playoffs_made`**: `1` if the manager qualified for playoffs, `0` if not.
- **`champion`**: `1` if the manager won the league title that season, `0` if not.
- **`playoff_finish`**: Final playoff placement (1 = Champion, 2 = Runner-Up, 3 = Third Place, null if omitted).

### Table 4: `award_types`
Master lookup list of official league award categories.
- **`award_id`** *(Primary Key)*: 1 = Championship, 2 = Runner-Up, 3 = 3rd Place, 4 = Playoffs, 5 = Best Regular Season, 6 = Last Place.
- **`code`** / **`name`**: Short code and display title.

### Table 5: `awards`
Stores official season awards earned by managers.
- **`id`** *(Primary Key)*: Unique award assignment ID.
- **`season_id`** *(Foreign Key → `seasons.season_id`)*: Season award was earned.
- **`manager_id`** *(Foreign Key → `managers.manager_id`)*: Manager receiving the award.
- **`award_id`** *(Foreign Key → `award_types.award_id`)*: The award category.

---

## 4. Team Management

In this website, **there is no separate `teams` database table**. A "Team" is defined as a **Manager + Their Per-Season Team Name**.

### How to Change a Current Team Name:
1. Open `canonical-import.js`.
2. Locate the relevant season row at the bottom of the data string. For example, for Season 20 (2027):
   ```text
   2027|2|Ben Casalino|Barles Charkley|0|0|0|0|0
   ```
3. Change `"Barles Charkley"` to the new team name (e.g. `"New Team Name"`).
4. Save the file and run `npm run init-db` in your local terminal.

### What Happens to Historical Seasons When a Team Name Changes?
- **Past records are 100% PRESERVED!**
- If Ben Casalino was named `"The RonArtesticles"` in Season 3 (2010) and changes his team name in Season 20 (2027) to `"New Team Name"`, Season 3 will still permanently display `"The RonArtesticles"`.
- Historical team names are stored individually in the `season_results.team_name` column per season.

### How to Change Team Colors / Logo:
Team colors and logos belong to the **Manager** entity in `managers` (and mapped via `canonical-import.js`). See [Section 6](#6-team-logos--images) and [Section 7](#7-colors--branding).

### Team Abbreviations:
The website dynamically shortens long manager names or team labels in responsive table views (such as converting `"Jonathan"` to `"Jon"`). There are no abbreviation codes stored in the database.

---

## 5. Manager Management

Managers are the primary anchor of the entire website. All career stats, GOAT scores, trophy cases, Hall of Fame eligibility, and career trajectories are linked to `manager_id`.

### How to Change a Manager's Name:
1. Open `canonical-import.js`.
2. Update the manager's name in `managerBranding` and `legacyColors` keys, or add an entry to `identityAliases`:
   ```javascript
   const identityAliases = {
     'Old Name': 'New Name',
   };
   ```
3. Run `npm run init-db`. All historical records and career totals will automatically bind to the new manager name.

### How to Add a New Manager:
1. Open `canonical-import.js`.
2. Add a branding assignment to `managerBranding`:
   ```javascript
   'New Manager Name': { logo: 'basketball', colorIndex: 66 },
   ```
3. Assign custom colors in `legacyColors`:
   ```javascript
   'New Manager Name': ['#FF0000', '#000000'],
   ```
4. If active for the current/upcoming season, add their name to `activeManagerNames`:
   ```javascript
   const activeManagerNames = new Set([
     ...
     'New Manager Name',
   ]);
   ```
5. Add their season entries to `canonicalRows` (e.g. `2027|12|New Manager Name|Team Name|0|0|0|0|0`).
6. Run `npm run init-db`.

### How to Mark a Manager Active or Inactive:
- In `canonical-import.js`, managers listed in the `activeManagerNames` set receive `active = 1`.
- On the **League Leaders** table, active managers display a green dot next to their name.

### ⚠️ WARNING — What NEVER to Do with Managers:
- **NEVER delete a `manager_id` directly in SQLite** without removing or reassigning their rows in `season_results` and `awards`. Doing so breaks database foreign key integrity and will crash pages like Trophy Case and Careers.
- **NEVER change a `manager_id` number manually** once created.

---

## 6. Team Logos & Images

Your website uses **two distinct types of images/logos**:

### Type A: Website Header & Footer Logos (Filesystem Assets)
- **Location**: `/images/bsbasketball-logo.gif`
- **File Format**: GIF, PNG, or SVG.
- **How to Replace**: Replace the physical file at `images/bsbasketball-logo.gif`.
- **Reference**: `<img src="/images/bsbasketball-logo.gif">` in `index.html`.

### Type B: Team & Manager Icons (Font Awesome 6 Icon System)
Team logos are **vector icon class strings** provided by Font Awesome 6 (e.g., `'fa-solid fa-mountain'`, `'fa-solid fa-trophy'`, `'fa-solid fa-crown'`, `'fa-solid fa-paw'`).

- **Storage**: Stored as text strings in the `team_logo` column of the `managers` database table.
- **Configuration**: Mapped in `canonical-import.js` under `managerBranding`:
  ```javascript
  'Ben Casalino': { logo: 'mountain', colorIndex: 2 },
  ```
- **How it Renders**:
  ```html
  <span class="team-logo" style="--team-color-1: #C39E6D; --team-color-2: #275ED4">
    <i class="fa-solid fa-mountain" aria-hidden="true"></i>
  </span>
  ```
- **How to Change a Manager's Icon**:
  1. Pick any valid icon name from [FontAwesome.com](https://fontawesome.com/icons) (Free solid icons).
  2. In `canonical-import.js`, update the manager's `logo` string (e.g. `'chess-rook'`, `'bolt'`, `'fire'`).
  3. Run `npm run init-db`.
- **If an Icon Is Missing or Invalid**: Font Awesome fails gracefully and renders a small empty square without breaking the page layout.

---

## 7. Colors & Branding

Each manager has an assigned **Primary Color** (`team_color_1`) and **Secondary Color** (`team_color_2`).

### Where Colors Are Defined:
In `canonical-import.js`, explicit HEX colors are declared in `legacyColors`:
```javascript
'Ben Casalino': ['#C39E6D', '#275ED4'], // [Primary HEX, Secondary HEX]
'Jonathan Hennke': ['#1D1160', '#E56020'],
```
If a manager is not listed in `legacyColors`, the system automatically calculates two complementary HSL colors using `getTeamColors(colorIndex)`.

### Where Team Colors Appear on the Site:
- **Logo Badges**: Rendered as a two-color split gradient background behind every manager's icon.
- **Career Trajectory Chart**: Fills the area under the trajectory line with a soft gradient generated from the manager's primary and secondary colors.
- **Season History**: Shown on the champion badge on Season cards.

### Global Theme Colors vs. Team Colors:
- **Global Theme Colors** are defined in `css/styles.css` using CSS custom properties:
  - Background: `--bg: #0d0f14`
  - Cards & Surfaces: `--surface: #161a22`, `--surface-2: #1e2430`
  - Accent / Brand Orange: `--brand: #e65100`
- Team colors are applied inline per-manager badge and do not override global site theme navigation.

---

## 8. Seasons & Season Management

### How Seasons Are Represented:
Seasons are numbered sequentially starting at Season 1 (2008).
- **Season 19** = 2026
- **Season 20** = 2027 (current open season)

### How to Create a New Season (e.g., Season 21 / 2028):
1. Open `canonical-import.js`.
2. Append the new season's manager roster rows at the end of `canonicalRows`:
   ```text
   2028|1|Jonathan Hennke|WinDy CitY ChaMp|0|0|0|0|0
   2028|2|Ben Casalino|Barles Charkley|0|0|0|0|0
   ...
   ```
3. Run `npm run init-db`.
4. In `index.html` and `js/app.js`, add the link for the new season to the main navigation bar.

### How to Finalize a Season:
When a season completes in the spring:
1. Open `canonical-import.js`.
2. Update that season's rows in `canonicalRows` with final stats:
   - Regular season rank (1, 2, 3...)
   - Team Name
   - Wins, Losses, Ties
   - Playoffs Made (`1` or `0`)
   - Champion status (`1` for champion, `0` for others)
3. Run `npm run init-db`.
4. The system automatically recalculates:
   - League Leaders wins/losses/win %
   - GOAT Scores & Rankings
   - Trophy Case & Award Badges
   - Hall of Fame Milestone Progress
   - Career Trajectory charts & timeline tables

---

## 9. Historical Data Rules

### What Identifies a Manager Across Seasons?
The **Manager Entity** (`manager_id` / `managers.name`) is the permanent anchor across all 20 seasons. Even if a manager changes their team name 10 times, their career stats, GOAT points, win/loss record, and trophy case remain connected to their manager identity.

### Source Data vs. Derived/Calculated Data:

| Data Element | Type | Storage Location / Calculation |
| :--- | :--- | :--- |
| **Manager Names & Branding** | Source | `managers` table |
| **Season Results (W-L, Ranks, Team Names)** | Source | `season_results` table |
| **Championship Status** | Source | `season_results.champion = 1` |
| **Official Award Records** | Derived | `awards` table (populated by `recalculateAwards()`) |
| **All-Time Win Totals & Win %** | Derived | Dynamically aggregated in `getLeaderRows()` |
| **GOAT Score & Rank** | Derived | Dynamically calculated by `calculateGoatScore()` in `server/trophy-case.js` |
| **Hall of Fame Eligibility** | Derived | Dynamically checked by `hallOfFameProgress()` |
| **Career Trajectories & Streaks** | Derived | Dynamically built by `getCareerTrajectoryData()` |

### GOAT Scoring Formula Reference:
The current GOAT Score formula implemented in `server/trophy-case.js` is:

$$\text{GOAT Score} = (\text{Titles} \times 100) + (\text{Runner-Ups} \times 45) + (\text{3rd Places} \times 30) + (\text{Best Reg. Seasons} \times 35) + (\text{Playoffs} \times 15) + (\text{Week Wins} \times 5) + (\text{Seasons Played} \times 10) - (\text{Last Places} \times 25)$$

If you ever adjust any of these point weights in `server/trophy-case.js`, the entire site (GOAT page, leaderboards, trophy cases, career charts, and timeline tables) automatically updates without altering historical game results.

---

## 10. Updating & Deploying Changes to the Live Website

Your website is hosted on **Namecheap Shared Hosting with cPanel** and linked to your GitHub repository (`github.com/bencasalino/bsbball-dev`).

### To Publish Code or Data Updates to `bsbasketball.net`:

1. **Make Changes Locally**: Edit your files (e.g. `canonical-import.js`, `js/app.js`, `css/styles.css`).
2. **Rebuild Local DB & Test**:
   ```bash
   npm run init-db
   npm test
   ```
3. **Commit & Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update league data"
   git push origin main
   ```
4. **Deploy in Namecheap cPanel** (Takes 15 seconds):
   - Log into cPanel at Namecheap.
   - Open **Git Version Control** → click **Manage** next to `bsbasketball` → click **Update from Remote** (or **Pull Head Only**).
   - Open **Setup Node.js App** → click **Restart Application** at the top.

Your live site at `https://bsbasketball.net` will instantly reflect your updates!

---

*Manual maintained for BS Basketball League (`bsbasketball.net`). Last updated: Season 20 (2027).*
