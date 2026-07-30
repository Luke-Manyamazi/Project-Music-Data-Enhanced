# Project Music Data (Enhanced)

A small vanilla JavaScript web app that analyses a user's music listening history and answers a set of questions about their habits (favourite song/artist, Friday night listening, longest listening streak, songs played every day, top genres, etc.).

This started as a coding-exercise project (data provided via mock functions, no backend/database) and has since been extended with modular utility helpers and unit tests.

## Features

Given mock listen-event data for four users, the app displays, per selected user:

- Most listened-to song and artist, by number of listens and by total listening time
- Most listened-to song during "Friday night" hours (Fri 5pm – Sat 4am), by count and by time
- Longest streak of consecutive listens to the same song
- Songs listened to on every day the user listened to music (if any)
- Top genres by number of listens

Questions that don't apply to a user (e.g. no Friday-night listens, no every-day songs) are omitted from the results rather than shown empty, and a user with no listening history gets an explicit "didn't listen to any songs" message.

## Tech stack

- Vanilla JavaScript (ES modules, `.mjs`), no frontend framework or build step
- Plain semantic HTML for the UI
- Node.js built-in test runner (`node:test` / `node:assert`) for unit tests
- No external dependencies

## Project structure

```
Project-Music-Data/
├── index.html          # Page markup: user dropdown + results section
├── script.mjs           # Main entry point, wires up the UI and computes all answers
├── data.mjs             # Mock data source (getUserIDs, getListenEvents, getSong)
├── common.mjs           # Small shared helper (countUsers)
├── common.test.mjs      # Unit tests (Node's built-in test runner)
├── package.json
└── src/
    └── utils/
        ├── aggregate.mjs  # countBy / sumBy / topN helpers
        ├── set.mjs        # Set intersection helper
        └── time.mjs       # Local-day and Friday-night time helpers
```

The actual project lives in the `Project-Music-Data/` subdirectory.

## Getting started

Because the app uses native ES modules, it must be served over HTTP — opening `index.html` directly via a `file://` URL will not work.

```bash
cd Project-Music-Data
npx http-server .
```

Then open the printed local URL in a browser and pick a user from the dropdown to see their stats.

## Running tests

```bash
cd Project-Music-Data
npm test
```

This runs `common.test.mjs` via `node common.test.mjs`, which exercises `countUsers` and the `sumBy` aggregation helper.
