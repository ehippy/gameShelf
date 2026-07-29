# gameShelf — Project Conventions

## Adding a New Game

Games live in `games/` as single self-contained HTML files. Convention:

- **File**: `games/<game-name>.html` (lowercase, hyphenated name)
- **Structure**: `<html>` with inline `<style>` and `<script>` for game-specific code only. Link shared resources with `../styles.css` and `../script.js`.
- **Canvas**: Canvas-based rendering is the norm. Grid dimensions are game-specific — pick what fits the game (Tic Tac Toe uses 3×3, Minesweeper uses 16×16, 2048 uses 4×4). Keep the canvas reasonably sized (400×400 works well for most).
- **Controls**: Keyboard-driven with reversal prevention (for Snake-like games).

### Registering the Game

Adding a game file is not enough — you must also add a card entry to `games/index.html` inside the `<div class="games-grid">`:

```html
<a href="<game>.html" class="game-card" data-category="<category>">
    <div class="card-thumb" style="background: linear-gradient(135deg, <color1>, <color2>);">
        <span class="thumb-icon">🎮</span>
    </div>
    <div class="card-info">
        <h3>Game Name</h3>
        <p class="card-desc">Short description.</p>
        <span class="card-tag <category>">Category</span>
    </div>
    <div class="card-play">▶ Play</div>
</a>
```

Pick an existing `data-category`: `action`, `puzzle`, `arcade`, `strategy`, `board`, or `casual`.

## Known Issues

- **`node_modules/` committed to repo**: No `.gitignore` exists — `node_modules/` and `package-lock.json` are version-controlled. This has caused repeated merge conflicts (4 failures for the 2048 deploy alone). Add `.gitignore` with `node_modules/` immediately before any deploy work.
- **Merge conflicts in `index.html`**: The root `index.html` games grid is edited by multiple agents. Coordinate before modifying it, or resolve conflicts early.
- **GitHub Pages**: CI/CD is configured via `.github/workflows/deploy.yml` — deploys the entire repo to GitHub Pages on push to `main`.
