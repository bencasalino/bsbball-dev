# BS Basketball League History

This repository contains a Node + Express frontend/API backed by the existing SQLite league database.

## Files

- `index.html` — app shell and persistent navigation.
- `js/app.js` — lightweight frontend router and page rendering.
- `css/styles.css` — shared styling for dashboard cards, tables, and league pages.
- `sql/schema.sql` — database schema.
- `sql/seed.sql` — sample league data.
- `init-db.js` — Node script that creates `data/league.db`.
- `download-lexend.sh` — optional local Lexend font downloader.
- `server/index.js` — Express API server.

## Setup

```bash
npm install
npm run init-db
npm start
```

The app runs at `http://localhost:3000`.

If port `3000` is already in use, run:

```bash
npm run start:3001
```

That starts the app at `http://localhost:3001`.

## Frontend Routes

- `/`
- `/leaders`
- `/seasons`
- `/seasons/:id`
- `/trophy-case`
- `/hall-of-fame`
- `/record-book`

## API Endpoints

- `GET /api`
- `GET /api/league/summary`
- `GET /api/leaders`
- `GET /api/managers`
- `GET /api/managers/:id`
- `GET /api/seasons`
- `GET /api/seasons/:id`
- `GET /api/seasons/:id/results`
- `GET /api/awards`
- `GET /api/awards/manager/:managerId`
- `GET /api/trophy-case`
- `GET /api/record-book`

## Quick test

```bash
curl http://localhost:3000/api/league/summary
curl http://localhost:3000/api/leaders
curl http://localhost:3000/api/seasons/20
```

If you started on port `3001`, use:

```bash
curl http://localhost:3001/api/league/summary
curl http://localhost:3001/api/leaders
curl http://localhost:3001/api/seasons/20
```

## Notes

- To host Lexend locally, run `bash download-lexend.sh`.
- The Hall of Fame page currently uses a small frontend configuration list of manager IDs so the database schema stays unchanged.
