# gameShelf — Project Conventions

## Adding a New Game

Games live in `games/` as single self-contained HTML files. Convention:

- **File**: `games/<game-name>.html` (lowercase, hyphenated name)
- **Structure**: `<html>` with inline `<style>` and `<script>` for game-specific code only. Link shared resources with `../styles.css` and `../script.js`.
- **Canvas**: Prefer canvas-based rendering; 400×400 canvas with a 20×20 grid is the established standard (see Snake).
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

- **LLM timeouts**: The Qwen3.6-35B-A3B endpoint has timed out repeatedly. If a code generation task fails with an API timeout, retry or switch endpoints.
- **Merge conflicts in `index.html`**: The root `index.html` games grid is edited by multiple agents. Coordinate before modifying it, or resolve conflicts early.
- **No GitHub Pages deploy step yet**: CI/CD is planned but not configured.
