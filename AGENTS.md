# gameShelf — Project Conventions

## Project Goal

We're going to make a bunch of game reimplementations and tie them together with some nice landing page in the style of crazygames.

## Adding a New Game

Games live in `games/` as single self-contained HTML files. Convention:

- **File**: `games/<game-name>.html` (lowercase, hyphenated name)
- **Structure**: `<html>` with inline `<style>` and `<script>` for game-specific code only. Link shared resources with `../styles.css` and `../script.js`.
- **Canvas**: Canvas-based rendering is the norm. Grid dimensions are game-specific — pick what fits the game (Tic Tac Toe uses 3×3, Minesweeper uses 16×16, 2048 uses 4×4). Keep the canvas reasonably sized (400×400 works well for most).
- **Controls**: Keyboard-driven with reversal prevention (for Snake-like games).

### Registering the Game

Adding a game file is not enough — you must also add a card entry to `index.html` inside the `<div class="games-grid">`:

⚠️ **Merge conflict risk**: `index.html` is edited whenever a new game is registered. Coordinate with other agents or resolve conflicts early.

Valid categories: `action`, `puzzle`, `arcade`, `strategy`, `board`, `casual`.

### Page Styling

- **Footer**: All pages must include the consistent footer text: `© 2025 gameShelf — All games built in browser — no downloads required`. Do not use variant phrasing.

## Known Issues

- **`node_modules/` committed to repo**: No `.gitignore` exists — `node_modules/` and `package-lock.json` are version-controlled. This has caused repeated merge conflicts (4 failures for the 2048 deploy alone). Add `.gitignore` with `node_modules/` immediately before any deploy work.
- **Merge conflicts in `index.html`**: The root `index.html` games grid is edited by multiple agents. Coordinate before modifying it, or resolve conflicts early.
- **GitHub Pages**: CI/CD is configured via `.github/workflows/deploy.yml` — deploys the entire repo to GitHub Pages on push to `main`.
