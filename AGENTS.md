# gameShelf — Project Conventions

## Project Goal

We're going to make a bunch of game reimplementations and tie them together with some nice landing page in the style of crazygames.

## Catalog & Routing Conventions

### Catalog field naming

Always use **`slug`**, **`title`**, and **`category`** for catalog entries.

**Deprecated (do not use):** `id`, `name`, and `genre` — these field names are deprecated and must never appear in new code.

Each catalog entry follows the shape defined in `src/data/gamesCatalog.js`:

```js
{
  slug: 'snake',          // unique kebab-case identifier
  title: 'Snake',         // human-readable display name
  description: '...',     // short description
  thumbnail: '...',       // data URI or URL for the game thumbnail
  category: 'Arcade',     // category string (e.g. 'Arcade', 'Puzzle', 'Casual')
  isNew: false,           // whether the game is newly added
  dateAdded: '2025-01-15T00:00:00Z'
}
```

To look up a catalog entry programmatically, always call **`gameStore.getGameBySlug(slug)`** from the Pinia store (`src/stores/gameStore.js`). It returns the matching entry or `undefined` if no game with that slug exists.

### Route slug validation

Always validate route slugs against `gameStore.getGameBySlug()` or `getKnownSlugs()` before passing them to dynamic imports or localStorage operations. Unvalidated slugs cause runtime errors and present security risks.

The project provides the following helpers in `src/stores/scoreStore.js`:

- **`getKnownSlugs()`** — returns a `Set` of all valid slugs extracted from the catalog. Use it when you need a quick membership check against the full catalog.

- **`isValidSlug(slug)`** — a regex-based guard that checks a slug against `/^[a-z0-9-]+$/` and verifies it exists in the catalog. Use this for defense-in-depth when validating user-supplied slugs.

- **`gameStore.getGameBySlug(slug)`** — the canonical way to look up a game by slug; returns `undefined` for unknown slugs.

**Consequences of skipping validation:**

- **Runtime 404s** — passing an invalid slug to a dynamic import (e.g. `import(\`../games/${slug}/App.vue\`)`) resolves against a non-existent module path, producing a bundle error or 404 at runtime.
- **Security issues (localStorage key injection)** — using a malformed or user-supplied slug as a storage key (e.g. `` `gamescore_${injected_key}` ``) can corrupt existing entries, allow cross-game data pollution, or even inject arbitrary keys into localStorage.

### Game Initialization

Games must not auto-start on page load. This convention was learned from the Flappy Bird auto-start bug, where the game began running immediately when the page loaded, leaving the user with no agency to control when the game started. The game should instead wait for the user's first input before beginning.

The convention has three rules:

1. **`init()` must not set `isPlaying = true`** — The initial state from `createInitialState()` must have `isPlaying: false`. `init()` should simply call `createInitialState()` and return the state; it must not override `isPlaying` to `true`.

2. **`reset()` must not set `isPlaying = true`** — `reset()` must also preserve the non-playing initial state (`isPlaying: false`), ensuring a reset puts the game back in a waiting state rather than auto-restarting.

3. **`handleKeydown()` must use three-way logic** — All keyboard input handling must distinguish between three states:
   - **Not playing, not game over**: A keypress starts the game (`isPlaying = true`).
   - **Game over**: A keypress resets the state and starts playing.
   - **Already playing**: The key performs its normal game action.

```js
/**
 * Handle keyboard input. Exported for GamePage to wire up.
 * Three-way logic:
 *   - Not playing + not game over → start the game
 *   - Game over → reset state and start playing
 *   - Already playing → perform normal action
 */
export function handleKeydown(key) {
  if (!state) return

  if (key === 'ArrowUp' || key === ' ') {
    if (state.isGameOver) {
      // Restart: reset state and start playing
      state = createInitialState()
      state.isPlaying = true
      // ... game-specific setup ...
    } else if (!state.isPlaying) {
      // Start game on first input
      state.isPlaying = true
      // ... game-specific setup ...
    } else {
      // Already playing — perform normal action
      // ... game-specific action ...
    }
  }
}
```

**Consequence of violation:** If `isPlaying` is `true` from initialization, the game starts running immediately on page load with no user control, making the game unplayable (the user has no agency to control when the game starts).

> **Testing tip:** When writing unit tests for game logic, always verify that `state.isPlaying` is `false` immediately after calling `init()` or `reset()`. Asserting `expect(state.isPlaying).toBe(false)` after initialization is a quick regression check against accidental auto-start.

## Testing Conventions

This project uses **two separate test frameworks** that coexist in the same codebase: **Vitest** for unit/component tests and **Playwright** for E2E browser tests.

### Vitest — Unit & Component Tests

- **File pattern:** `tests/**/*.test.js` (and `tests/games/**/*.test.js`)
- **Run with:** `npm test` (which runs `vitest run`)
- **Import from:** `vitest`

```js
// Vitest (unit/component)
import { describe, it, expect, beforeEach } from 'vitest'

describe('my tests', () => {
  it('passes', () => {
    expect(1 + 1).toBe(2)
  })
})
```

### Playwright — E2E Browser Tests

- **File pattern:** `tests/e2e/**/*.spec.js`
- **Run with:** `npm run test:e2e` (which runs `playwright test`)
- **Import from:** `@playwright/test`

```js
// Playwright (E2E)
import { test, expect } from '@playwright/test'

test('my e2e test', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('Welcome')
})
```

### Namespace Conflict and Workaround

Both Vitest and Playwright expose a global `test` function:

- **Vitest** — when `globals: true` is set in the config, Vitest injects `describe`, `it`, `test`, `expect`, etc. as globals.
- **Playwright** — uses its own `test` function from `@playwright/test` as the entry point for E2E tests.

If Vitest processes Playwright test files (the `*.spec.js` files in `tests/e2e/`), Vitest's global `test` will overwrite Playwright's `test`, breaking E2E tests entirely.

**The workaround** is to add an `include` pattern to the Vitest config so it only scans `*.test.js` files and ignores `*.spec.js` files:

```js
// vite.config.js
export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],  // only Vitest unit/component tests
    globals: true
  }
})
```

This ensures:

- Vitest only processes `tests/**/*.test.js` files (unit/component tests)
- Playwright exclusively owns `tests/e2e/**/*.spec.js` files (E2E tests)
- No namespace collision between the two frameworks' `test` functions

### Short-circuit assertions (`||`) anti-pattern

> **Never combine assertions with `||` to check multiple conditions.**

When you write `expect(a).toBe(1) || expect(b).toBe(2)`, the left side runs and is actually verified. But `expect().toBe()` returns `undefined` (or a Promise in async contexts), which is falsy. This means:

1. The right side (`expect(b).toBe(2)`) **never executes** — `||` short-circuits because the left operand is falsy (even when the assertion *passed*).
2. Only the **left-most assertion** in the chain is ever checked.
3. Silent failures: the test file may pass even though the right-side assertions are completely untested.

**Anti-pattern (do not use):**
```js
expect(result).toContain('foo') || expect(result).toContain('bar')
```

**Correct approach:**
```js
expect(result).toContain('foo')
expect(result).toContain('bar')
```

Each condition gets its own `expect()` call — either on separate lines within the same `it()`, or split into separate `it()` blocks for clarity. This ensures every condition is actually executed and verified by the test framework.

**This trap has appeared repeatedly across `tests/components.test.js`, `tests/games/flappy-bird.test.js`, `tests/games/tetris.test.js`, `tests/games/snake.test.js`, and `tests/infrastructure.test.js`. If you see `||` between `expect()` calls, rewrite each as an independent assertion.**

## Search / Filter UI Pattern

This section documents the established pattern for UI-driven list filtering in gameShelf. It covers state ownership, UI binding, computed filtering, and logic rules. Future agents working on the game shelf listing, search, or category filtering should follow this pattern.

**1. State ownership**
The `gameStore` (defined in `src/stores/gameStore.js`) owns two reactive state properties:
- `searchQuery` — string, default `''` — the text the user typed into the search
- `selectedCategory` — string, default `''` — the category the user selected

These are plain reactive fields on the Pinia store — no mutations or actions are needed to read or write them. Any component that calls `useGameStore()` gets direct access.

**2. UI bindings in AppHeader.vue**
The `AppHeader` component (`src/components/AppHeader.vue`) renders two input elements and binds them directly to the store properties:
- **Search input** — two-way binding via `:value="gameStore.searchQuery"` and `@input="gameStore.searchQuery = $event.target.value"`
- **Category select** — two-way binding via `:value="gameStore.selectedCategory"` and `@change="gameStore.selectedCategory = $event.target.value"`

When the user types or selects, the store property is updated immediately. Because Pinia reactivity is reactive, `HomeView`'s computed property reacts automatically.

**3. Computed filtering in HomeView.vue**
The `HomeView` component (`src/views/HomeView.vue`) defines a `filteredGames` computed property that chains two filters: text search and category. It iterates over `gameStore.catalog`, applying each filter only when its corresponding store property is non-empty. The template renders `<GameCard v-for="game in filteredGames">`.

**4. Case-insensitive matching**
All comparisons are case-insensitive using `.toLowerCase()` on both sides of the comparison. The original value of `gameStore.searchQuery` is preserved in the store unchanged; lowercasing is done only at comparison time.

**5. AND/OR logic**
- **Within text search (OR):** A game matches the search query if *any* of title, description, or category contains the query (case-insensitive).
- **Between filters (AND):** If both `searchQuery` and `selectedCategory` are non-empty, a game must satisfy *both* filters. Each filter is applied sequentially.

**Reference documentation**
A dedicated reference document at `docs/SEARCH_FILTER_PATTERN.md` contains full code snippets and a pipeline summary diagram showing the complete data flow: User input → AppHeader → gameStore → HomeView (computed) → GameCard.

**Tests**
The file `tests/filtering.test.js` is the executable specification of this pattern, containing 25 tests (19 unit tests for filtering logic + 6 integration tests that mount HomeView and AppHeader against a real Pinia store). Run with `npm test`.

**Current state note**
The category options in `AppHeader.vue` are currently hardcoded. The pattern is fully compatible with future dynamic category generation from `gameStore.catalog`.

**Pipeline summary**
```
User types/selects
        │
        ▼
  AppHeader.vue
    :value="gameStore.searchQuery"
    @input → store.searchQuery = ...
    :value="gameStore.selectedCategory"
    @change → store.selectedCategory = ...
        │
        ▼
  gameStore (Pinia store)
    searchQuery: string, default ''
    selectedCategory: string, default ''
        │
        ▼
  HomeView.vue  ← computed(() => { … })
    filteredGames (computed property)
        │
        ▼
  GameCard × N  ← v-for="game in filteredGames"
```

## Deployment Failure Convention

### Transient failures

Watch for **HTTP 408 request timeout** and **network errors** that can occur during push or deploy steps (e.g. `actions/upload-pages-artifact`, `actions/deploy-pages`, or `git push` operations). These are infrastructure-level flakiness — not a reflection of the code quality.

### Retry protocol

On encountering a transient failure:

1. Retry the deployment step up to **2 additional times** (3 total attempts).
2. Wait approximately **30 seconds** between retries to allow the transient issue to resolve.
3. Log each attempt clearly (e.g. "Attempt 1/3", "Attempt 2/3", "Attempt 3/3") so the history is visible in CI output.

### Escalation

If all 3 attempts fail:

- **Do not bounce the card back** to the developer or PM.
- Escalate the card to the PM with a note that **the work is approved but blocked by infrastructure**.
- Include details of the failures: error messages, timestamps, and which step failed.
- Set the card status to reflect that work is complete and awaiting infrastructure resolution.

### Goal

Avoid the pattern where correct code bounces indefinitely between the Deployer and PM due to flaky CI infrastructure. The Deployer should absorb transient failures, retry, and only escalate with evidence — never reject approved work solely because of infrastructure hiccups.

## Last Reviewed

- **Reviewed:** 2025-07-09
- **Scope:** ESLint/anti-pattern documentation — confirmed current, no updates required.
- **Verified sections:** Short-circuit assertions (||) anti-pattern (lines 160–183), Vitest/Playwright namespace conflict workaround (lines 133–158), game initialization conventions (lines 48–94), catalog field naming (lines 9–27), route slug validation (lines 31–46), search/filter UI pattern (lines 185–244), deployment failure conventions (lines 246–271).
- **Excluded:** ESLint `node/recommended` dependency fix — one-off workaround, not a recurring project practice.
