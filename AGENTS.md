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

- **Runtime 404s** — passing an invalid slug to a dynamic import (e.g. `import(\`../games/${slug}/gameLogic.js\`)`) resolves against a non-existent module path, producing a bundle error or 404 at runtime.
- **Security issues (localStorage key injection)** — using a malformed or user-supplied slug as a storage key (e.g. `` `gamescore_${injected_key}` ``) can corrupt existing entries, allow cross-game data pollution, or even inject arbitrary keys into localStorage.

### Route param naming

Route parameter names in Vue Router must use `:slug`, never `:id`, when identifying a game in the catalog. This keeps the route param aligned with the catalog field naming convention (`slug`, not `id`) and avoids confusion between the game's catalog identifier and any numeric IDs that might exist elsewhere in the system.

**Route definition** in `src/router/index.js`:

```js
// Correct — uses :slug
{ path: '/game/:slug', component: () => import('../views/GamePage.vue') }
```

When accessing the slug in components like `GamePage.vue`, always read it from `route.params.slug`:

```js
// Correct — reads from route.params.slug
const slug = route.params.slug
const game = gameStore.getGameBySlug(slug)
```

**Guidance for new routes:** When adding new routes that identify a game or any other catalog entity, use `:slug` as the parameter name. This consistency makes the code easier to read and keeps the domain vocabulary uniform across the routing layer.

### Vite Dynamic Import Convention

Never use string-concatenated dynamic imports for loading game modules. The pattern `import(\`../games/${slug}/gameLogic.js\`)` fails on the live site because Vite cannot statically analyze the import path during build time — the glob is not expanded to included modules, so the target module is never bundled.

**Correct approach:** Use `import.meta.glob()` to pre-collect all gameLogic.js modules into a static map at module evaluation time, then look up the appropriate module by slug at runtime:

```js
// Pre-collect all gameLogic.js modules into a static map
const gameModules = import.meta.glob('./src/games/*/gameLogic.js', { eager: false })

// Later, look up by slug at runtime:
const modulePath = `./src/games/${slug}/gameLogic.js`
const importedModule = gameModules[modulePath]
if (!importedModule) {
  // handle missing module
  router.replace('/404')
  return
}
gameLogic = await importedModule()
```

**Path consistency requirement:** The glob pattern and runtime lookup key must use matching paths from the perspective of the importing file. If the glob is defined relative to the current file (e.g., `'./src/games/*/gameLogic.js'` from `src/views/`), the runtime key must use the same relative path structure (e.g., `'./src/games/${slug}/gameLogic.js'`). Mismatched paths cause lookup failures even when the glob itself is correct, because Vite's map keys are derived from the glob pattern's relative path.

**Consequences of violation:** Runtime 404s and broken game loading on the live site because Vite's build-time glob analysis cannot resolve string-concatenated paths — the module is never included in the bundle.

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
 *
 * Note: New games should use `handleKeydownTransition` from
 * `src/games/shared/gameHelpers.js` (see below) instead of writing
 * this manual `if/else` block. This example documents the three-way
 * logic rules (1–3); the helper encapsulates the same pattern.
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

### Three-way state transitions with handleKeydownTransition

**Preferred approach:** Use the shared `handleKeydownTransition` factory from `src/games/shared/gameHelpers.js` to create a three-way state-transition handler. Five games already use it (`breakout`, `flappy-bird`, `snake`, `tetris`, `whack-a-mole`). It removes boilerplate from `handleKeydown()` and guarantees consistent behavior.

**Create the factory** at the module level with a `resetFn` for game-specific reset logic:

```js
import { handleKeydownTransition } from '../shared/gameHelpers.js'

// Create the transition handler once at module scope.
// resetFn resets state to initial conditions but MUST NOT set
// isPlaying — the helper handles that automatically.
const transition = handleKeydownTransition(() => {
  // Game-specific reset logic here.
  // Example (snake): Object.assign(state, createInitialState())
  //                 spawnFood()
})
```

**Call it from `handleKeydown()`** with `state`, `validKeys`, and an `actionFn`:

```js
export function handleKeydown(key) {
  if (!state) return

  const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

  // State transition (the helper handles all three cases)
  transition(state, key, validKeys, () => {
    // Already playing — do the game-specific action
    // ... game-specific action ...
  })

  // Game-specific action (runs after transition for valid keys)
  // ... direction change / movement logic ...
}
```

**Four transition cases** the helper covers:

1. **Game over + valid key** → calls `resetFn()`, re-reads state via the game's state getter (if resetFn reassigns the module-level state variable), then sets `state.isPlaying = true`.
2. **Not playing + valid key** → sets `state.isPlaying = true` (starts the game).
3. **Already playing + valid key** → calls `actionFn(key)` for the game-specific action (e.g. direction change).
4. **Key not in validKeys** → no-op; the helper skips the transition and `handleKeydown` proceeds to any game-specific action logic below the transition call.

**Exception: single keypress transitions state and performs an action (Flappy Bird)**

Some games need a single keypress to both transition state *and* perform an immediate action — for example, Flappy Bird's flap on every Space or ArrowUp press, regardless of whether the game was just started or was already running. The helper's `actionFn` only fires for the "already playing" case (case 3), not for the "not playing → playing" transition (case 2) or the "game over → playing" transition (case 1). To handle this, capture `wasPlaying` before the transition call, then check if the transition flipped `isPlaying` from `false` to `true` afterwards and perform the action in that case too.

```js
const wasPlaying = state.isPlaying
transition(state, key, validKeys, () => {
  // Already playing — do the action (e.g. flap)
  state.bird.velocity = FLAP_STRENGTH
})

// Not playing → just started playing → also perform the action
if (!wasPlaying && state.isPlaying) {
  state.bird.velocity = FLAP_STRENGTH
}
```

Here's why this works across the three scenarios:

1. **Already playing** → `wasPlaying` is `true`, `!wasPlaying && state.isPlaying` evaluates to `false` — the helper calls `actionFn`, the action executes once. Correct.
2. **Not playing → playing** → `wasPlaying` is `false`, `!wasPlaying && state.isPlaying` evaluates to `true` after the transition — `actionFn` is not called by the helper (the helper skips it for case 2), so the `if` block fires and performs the action once. Correct.
3. **Game over → playing** → same as case 2, `wasPlaying` is `false`, `!wasPlaying && state.isPlaying` evaluates to `true` after the transition — the helper returns early after setting `isPlaying = true` (case 1), so the `if` block fires and performs the action once. Correct.

Use this pattern only when a single keypress must both transition state and perform an immediate action. It is an exception to the normal pattern, not the recommended approach.

**ResetFn contract:** The `resetFn` callback **must NOT set `state.isPlaying = true`** — the helper handles that automatically. Its job is to restore game-specific state (score, grid, pieces, etc.) back to initial conditions. The game's own `reset()` function must also preserve `isPlaying: false` to comply with the no-auto-start rule.

**Concrete example (snake-style):**

```js
import { handleKeydownTransition } from '../shared/gameHelpers.js'

const transition = handleKeydownTransition(() => {
  Object.assign(state, createInitialState())
  spawnFood()
})

export function handleKeydown(key) {
  if (!state) return

  const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

  transition(state, key, validKeys, () => {
    // Already playing — direction handled below
  })

  switch (key) {
    case 'ArrowUp':    if (state.direction !== 'down') state.direction = 'up'    ; break
    case 'ArrowDown':  if (state.direction !== 'up')   state.direction = 'down'  ; break
    case 'ArrowLeft':  if (state.direction !== 'right') state.direction = 'left' ; break
    case 'ArrowRight': if (state.direction !== 'left')  state.direction = 'right'; break
  }
}
```

The `transition` function handles the three-way state machine, and the switch below is purely game-specific action logic. This pattern is used by breakout, snake, and several other games.

### DRY temptation trap in game logic

When you notice the same three-way handleKeydown state transition pattern repeated across multiple game files — game after game, every gameLogic.js doing roughly the same thing with different game-specific details — the natural instinct is to apply DRY and extract that shared logic into a helper. The temptation is real, and it's the right instinct in most contexts. In game logic, it's not.

The shared helper extraction showed that the abstraction introduced its own bugs: signature deviation from the expected spec (the helper's API drifted from what the gameLogic.js interface contract requires), redundant state assignment (the helper assigning `isPlaying` in a place where it shouldn't), and missing no-op tests (the test surface grew to cover the helper's API surface instead of each game's actual behavior). These are problems the original duplicated code in each individual gameLogic.js file never had. Every line of duplicated code lived in its own game's context, where you could trace it directly, test it directly, and reason about it directly.

Simple duplicated code is easier to reason about and test than a shared helper with its own API surface. A helper abstracts away the control flow — you can no longer see the three-way state transitions in context, you have to mentally trace through two files to understand a single game's keyboard handling — and the helper itself becomes a source of bugs with its own growing test surface. The duplication is cheap: a few lines of nearly identical if/else logic in each game is far easier to audit and understand than a helper function that silently changes behavior depending on what arguments you pass it.

When you see the same pattern across three game files, resist the urge. Write the three-way logic directly in each gameLogic.js, following the documented pattern. A little duplication in a well-understood control flow is a small price to pay for clarity.

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

### Silent-pass guard clauses anti-pattern

> **Never place early `return` statements between assertions inside an `it()` block.**

When you write `if (!something) return` or `if (skip) return` *after* an assertion, the early return silently skips all remaining code — including subsequent assertions. The test passes because execution returns normally, but the assertions after the guard were never verified.

This is especially dangerous because the trap is subtle: the guard itself may appear to make sense ("skip this if the condition isn't met"), but placing it between assertions means some verification is gated behind a conditional that can silently suppress failures.

**Contrast with legitimate setup guards:** Guards at the very top of an `it()` block, before any assertions, are fine — e.g. `if (!setupComplete) return` in setup code. The anti-pattern is guards inserted *after* an assertion or around a specific assertion chain that selectively bypasses the rest of the verification.

**Anti-pattern (do not use):**

```js
it('handles game over state after a critical move', () => {
  state = gameLogic.init()
  gameLogic.move('down')
  gameLogic.move('left')

  expect(state.isGameOver).toBe(true)
  if (!state.isGameOver) return  // <-- silent-pass gap: any assertions after this
                                 // are bypassed if isGameOver is true, and the
                                 // guard never actually triggers when the
                                 // condition is false

  expect(state.score).toBe(100)
  expect(state.grid.length).toBe(20)
})
```

While `if (!state.isGameOver) return` after `expect(state.isGameOver).toBe(true)` doesn't bypass the guard itself (the first assertion already confirmed the condition), any subsequent assertions are skipped, and the pattern is confusing and error-prone. It creates a gap where verification silently disappears.

**Correct approach:**

```js
it('handles game over state after a critical move', () => {
  const state = gameLogic.init()
  gameLogic.move('down')
  gameLogic.move('left')

  expect(state.isGameOver).toBe(true)
  expect(state.score).toBe(100)
  expect(state.grid.length).toBe(20)
})
```

Assert first, then return early if needed — but don't put a guard between assertions. If you truly need conditional branching, split into separate `it()` blocks rather than gating assertions behind a guard.

**This trap was found in the Tetris tests with 38 instances of mid-assertion guard clauses causing silent test passes.**

> **Testing tip:** When reviewing test files, scan for `return` statements inside `it()` blocks that appear after any assertion — if the return path could bypass subsequent assertions, the test has a silent-pass gap.

### Verifying Assertion Values Against Implementation

Test assertions are only as good as the values they compare against — a passing test with incorrect expected values proves nothing. This came up in the Whack-a-Mole keyboard input cycle, where tests contained incorrect hardcoded expected values (e.g. wrong `cursorRow` values after state transitions) while the implementation was correct, causing multiple review/fix rounds before the mismatch was noticed.

The pre-commit hook (`scripts/check-assertion-dupes.js`, run via `.husky/pre-commit`) is a hard commit block — it exits non-zero and prevents `git commit` from succeeding. When the hook flags identical `expect(...).toBe(X)` lines across consecutive `it()` blocks in the same `describe` scope, review whether the expected value was updated for each distinct test scenario. When the hook blocks your commit, that's expected — review the flagged assertions and fix any copy-paste errors before trying again.

After manual tracing through the expected behavior, ensure assertion values match reality, rather than assuming hardcoded numbers are correct.

The same manual-tracing habit extends beyond functional correctness to dead code detection — after removing or refactoring a code path, trace through the full module to check that orphaned imports and unused branches get cleaned up. The Whack-a-Mole review cycle showed this gap: when the `isGameOver` branch was removed, `renderGameOver` and the `scoreStore` import lingered in the file because the reviewer only verified functional correctness rather than the complete module state.

**False-positive calibration:** The pre-commit script (`scripts/check-assertion-dupes.js`) requires 5 or more unique `it()` blocks sharing the exact same assertion line before it flags a problem. Two to four consecutive tests with the same assertion is always a legitimate coincidence — each test independently verifies an invariant (for example, both `init()` and `reset()` having `isPlaying` set to `false`). Don't second-guess the tool when it actually flags 5+ blocks, and don't dismiss it as unreliable when 2–4 blocks happen to share an assertion.

### Deterministic seeding for tests using randomness

Pseudo-random number generators like `Math.random()` produce non-deterministic outcomes that cause flaky tests and spurious CI failures. A test that depends on randomness will produce different results on each run — sometimes passing, sometimes failing — making the test suite unreliable and impossible to debug consistently.

When a test or game logic depends on randomness, always use a seeded PRNG so you can reproduce the same random sequence across runs. This way a test that passes today will pass tomorrow, and a failure is immediately reproducible.

A simple approach is to bundle a lightweight seeded PRNG (like mulberry32) and inject it into the code under test. Here's a minimal mulberry32 implementation you can drop into a test helper:

```js
// A tiny seeded PRNG — mulberry32
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = seed + 0x6d2b79f5 | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
```

Use it in a test to drive deterministic randomness:

```js
const rand = mulberry32(42) // fixed seed → deterministic sequence

// When the game logic accepts a PRNG function:
const state = gameLogic.init({ rand })

// Or, when it calls Math.random() internally, stub it in the test:
const rand = mulberry32(42)
Object.defineProperty(Math, 'random', {
  value: rand,
  configurable: true
})
// ... now any Math.random() call within the test returns the seeded sequence
```

The key is picking one seed per test scenario and sticking with it. If a test needs a *different* random path, use a different seed — don't change the code between runs.

> **Testing tip:** Treat PRNG seeding the same way you treat fixture data — pick your seed once, write the test around the deterministic sequence it produces, and never change the seed to "make the test pass." The seed *is* the fixture.

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

Watch for **transient deployment failures** like timeouts, network errors, and infrastructure hiccups that can occur during push or deploy steps (e.g. `actions/upload-pages-artifact`, `actions/deploy-pages`, or `git push` operations). These are infrastructure-level flakiness — not a reflection of the code quality.

### Retry protocol

On encountering a transient failure:

1. Retry the deployment step up to **4 additional times** (5 total attempts) using exponential backoff.
2. Wait progressively longer between retries to give GitHub Pages infrastructure time to recover:
   - **Attempt 1:** First attempt, no wait
   - **Attempt 2:** 30-second delay
   - **Attempt 3:** 60-second delay
   - **Attempt 4:** 120-second delay (2 minutes)
   - **Attempt 5:** 180-second delay (3 minutes)
3. Before each attempt, a pre-check verifies GitHub API reachability. If the endpoint is completely unreachable (not returning 200 or 403), the deployment fails fast without wasting retries.
4. Log each attempt clearly (e.g. "Attempt 1/5", "Attempt 2/5", "Attempt 3/5", "Attempt 4/5", "Attempt 5/5") so the history is visible in CI output.

### Escalation

If all 5 attempts fail:

- **Do not bounce the card back** to the developer or PM.
- Escalate the card to the PM with a note that **the work is approved but blocked by infrastructure**.
- Include details of the failures: error messages, timestamps, and which step failed.
- Set the card status to reflect that work is complete and awaiting infrastructure resolution.

### Goal

Avoid the pattern where correct code bounces indefinitely between the Deployer and PM due to flaky CI infrastructure. The Deployer should absorb transient failures, retry, and only escalate with evidence — never reject approved work solely because of infrastructure hiccups.

## CI Pipeline Conventions

### CI test ordering

The GitHub Actions deploy workflow (`deploy.yml`) must maintain this step ordering:

1. **`npm ci`** — install dependencies (clean install)
2. **`npm test`** — run the full test suite (Vitest + build test)
3. **`npm run build`** — produce the production build

`npm test` must always run **after** `npm ci` (so tests execute against freshly installed dependencies) and **before** `npm run build` (so the test suite acts as a gate — failing tests block deployment). If the tests fail, the pipeline stops; it should never proceed to build or deploy.

The full workflow order is: checkout → setup-node → npm ci → npm test → npm run build → deploy-with-retry.

### Retry action — 5 attempts

The `deploy-with-retry` composite action (`./.github/actions/deploy-with-retry/`) uses **5 total attempts** for the deployment step, consistent with the retry protocol defined in the Deployment Failure Convention. The logic uses exponential backoff (30s, 60s, 120s, 180s delays between attempts) with a GitHub API pre-check before each attempt.

## Card-Level Postmortems

The struggles section must NOT be included when there is no friction. Do not write "Nothing notable" or any equivalent — write nothing.

Card-level postmortems should only include friction/struggles details **when friction actually occurred** — during development, review, or deployment.

When a card completed cleanly, do not pad the postmortem with boilerplate substitutes like "Nothing notable", "None", "N/A", "No friction", "Clean card", "No struggles", or any variation of these. If there is nothing to report, the postmortem is simply the summary line — no struggles section at all, not even an empty one.

**❌ Bad:**
```
Summary: Updated the game catalog slug field for all entries from the deprecated `id` field to `slug`.

Struggles: Nothing notable.
```

**✓ Good:**
```
Summary: Updated the game catalog slug field for all entries from the deprecated `id` field to `slug`. Refactored the game store to use `slug` consistently and updated all component bindings in HomeView and GameCard. All 25 filtering tests pass.
```

When reviewing or editing this section, treat it all as convention to preserve — you can remove section headers if they're redundant, but the prose about forbidden phrases and the example blocks are substantive conventions, not tool-specific boilerplate to strip.

**Correct — clean card (no struggles section at all):**
```
Summary: Updated the game catalog slug field for all entries from the deprecated `id` field to `slug`. Refactored the game store to use `slug` consistently and updated all component bindings in HomeView and GameCard. All 25 filtering tests pass.
```

*(That's the entire postmortem. Nothing after the summary line.)*

**Correct — friction occurred (struggles section present):**
```
Summary: Refactored the Flappy Bird game logic to fix the gravity inconsistency. Replaced the hardcoded acceleration value with a configurable constant.

Struggles: The gravity value was inconsistent between init() and the game loop — init() used 0.5 but the loop used 0.6. Spent a cycle tracing this through the state transitions before noticing the mismatch. Added a pre-commit check that verifies gravity is referenced from a single constant.
```

*(When friction *did* occur, include a `Struggles:` section that briefly describes what went wrong, what was learned, and what to watch for next time.)*

### Automated enforcement

The pre-commit hook `scripts/check-postmortems.js` enforces the no-boilerplate-struggles convention by scanning AGENTS.md's Last Reviewed section (the one at the end of the file) for boilerplate `**Struggles:**` lines. It flags entries where the struggles content reads like filler — "Nothing notable", "None", "N/A", "No friction", "Clean card", "No struggles" (case-insensitive, trimmed), or empty/whitespace-only — and exits with code 1 to block the commit. When violations are found, it prints details to stderr including the line number, date, and the offending content so you can locate and fix the problem quickly.

The hook runs automatically via `.husky/pre-commit` alongside `check-assertion-dupes.js`. If the hook fails and prints a violation, fix the affected Last Reviewed entries by either removing the boilerplate `**Struggles:**` line entirely (for clean cards) or replacing it with genuine friction/struggles detail (for cards where actual difficulty occurred). Do not suppress the hook — address the root cause: the struggles content itself.

## Pre-implementation Verification

Before writing any code for a game implementation card, always verify the game hasn't already been implemented. With only a handful of games built out of the full catalog, it's easy for cards to arrive for work that's already done — forcing the developer to fabricate changes just to satisfy the system's requirement of "a real diff." This step prevents that entirely.

1. **Look up the game's slug** from the card (the kebab-case identifier used in the catalog).
2. **Run `node scripts/verify-game-exists.js <slug>`** to check whether the game is already implemented.
3. **If the script reports the game exists** (exit 0), close the card immediately with a verification comment noting the game is already implemented — no code changes needed.
4. **If the script reports files are missing** (exit 1), proceed with implementation.
5. **If the script reports an invalid slug** (exit 2), check the card for typos or missing catalog entry before proceeding.

The script checks for two things:
- `src/games/<slug>/` directory (the game's code)
- `tests/games/<slug>.test.js` file (the game's tests)

Both must exist for the game to be considered fully implemented.

## Non-Feature Card Acknowledgment

Not every card in the backlog represents a feature to build. Some cards are system error notifications, placeholder test requests, invalid feature proposals, or pre-existing game confirmations — things that are valid work items but produce no code changes.

When you close such a card, write a brief acknowledgment note into a file under `docs/cards/` (e.g. `docs/cards/close-invalid-slug-card.md`). The note should state the card's title, the reason it's being closed without an implementation spec, and a one-line summary of any conclusion reached.

**Example scenarios:**

- **Invalid slug card** — a card asks to implement a game with a slug that doesn't exist in the catalog, or contains a typo in the slug. Close the card, note that the slug is invalid, and confirm whether a correct catalog entry needs to be added separately.
- **Pre-existing game card** — a card asks to implement a game that's already done. Confirm via `verify-game-exists.js`, then note the confirmation and close the card.
- **CI notification card** — a card documenting a transient CI failure or infrastructure flake. Note the root cause and whether a fix was applied.
- **Placeholder test request** — a card that was only meant to flag a future test improvement. Close with a note about whether the test was already added or what the next action should be.

**Template:**

```
Card: [Card title or reference]

Reason: [One sentence explaining why this card doesn't require implementation work — e.g. "Invalid slug in catalog", "Game already implemented", "CI flake, not a code issue"]

Conclusion: [One-line summary of what was found or decided.]
```

### No AGENTS.md update needed cards

Not every card produces a convention worth documenting. Sometimes a card is purely a verification task — confirming that a section exists, a script works, or tests pass — rather than introducing a new pattern. When you find yourself closing a card with "No AGENTS.md update needed," pause and ask whether the card was actually an implementation card or a verification card.

**"No AGENTS.md update needed" cards should be rare exceptions, not the default closure pattern.** Most cards that produce code changes naturally surface a convention worth documenting. If a card's acceptance criteria are entirely satisfied by confirming something that's already documented, it's a verification card, not an implementation card. Verification cards don't typically need AGENTS.md updates because they confirm existing conventions rather than introduce new ones. The Non-Feature Card Acknowledgment template already covers this category.

**Beware of recursive self-referential loops.** Multiple cards closing with the identical phrase "No AGENTS.md update needed — recent closed work contains fabricated claims and covered patterns" created a self-referential loop where each subsequent card echoed the same boilerplate, referencing the previous cards that all referenced one another, with no real new content produced in any of them. Avoid self-referential closure patterns. When closing such a card, do **NOT** use the phrase "No AGENTS.md update needed" or any variant of it as the closing note.

Instead, briefly note *why* no update was needed in specific, meaningful terms. Use language that a future agent can understand without reading the card's comment history:

- **Good:** "Pre-existing convention confirmed — the three-way handleKeydown logic was already documented in the Game Initialization section."
- **Good:** "Pattern already covered by the Short-circuit assertions anti-pattern section in Testing Conventions."
- **Bad:** "No AGENTS.md update needed — recent closed work contains fabricated claims and covered patterns."

Follow the same principle when writing the acknowledgment note to `docs/cards/<name>.md`. The note should state *what* was verified and *why* no new convention was introduced, in concrete terms.

This keeps the backlog tidy and auditable. Future agents reviewing closed cards will see a clear record of why no code was produced, rather than wondering whether the work was missed or the spec was incomplete.

## Backlog Triage & Scope Discipline

Before creating a card to update AGENTS.md or document a process improvement, check whether it addresses real friction observed during implementation, review, or deployment. The project practice is clear: no meta-documentation cards unless they prevent a real bug from recurring. Conventions should be codified only after they've been tested in the field and proven useful — not before. Several cards for boilerplate prevention guidelines, scope discipline text, and similar process conventions flowed through the full PM → Developer → Tester → Reviewer → Deployer pipeline only to be closed as out-of-scope, wasting agent turns that could have gone to actual work. This shouldn't happen.

Cards that document a pattern *only* after it caused real friction belong in AGENTS.md — the CI pipeline ordering convention stuck because a deploy failed, the Vite dynamic import convention was accepted because it caused runtime 404s, and the no-auto-start rule was born from a game that launched uninvited. Cards that are purely about codifying conventions no implementation has yet encountered a problem with do not. Generic scope discipline text, boilerplate prevention guidelines, and similar process improvements without a concrete, recurring bug behind them should be rejected by the PM before any spec is written. When a pattern is real, it will leave evidence in the wreckage.

## Game Addition Checklist

Quick reference for onboarding a new game to the project:

1. **`gameLogic.js` exports** — Create `src/games/<slug>/gameLogic.js` exporting `init()`, `update()`, `render(canvas)`, `reset()`, `handleKeydown(key)`, a mutable `state` object, and `CANVAS_WIDTH` / `CANVAS_HEIGHT` constants. See [Catalog & Routing Conventions](#catalog--routing-conventions) for project conventions.
2. **Catalog entry** — Add an entry to `src/data/gamesCatalog.js` with `slug` (kebab-case), `title`, `description`, `thumbnail`, and `category` fields. Do NOT use the deprecated `id`, `name`, or `genre` fields. See [Catalog field naming](#catalog-field-naming).
3. **Glob import** — Confirm the module is discoverable via `import.meta.glob('./src/games/*/gameLogic.js')` so Vite can statically analyze the import at build time. See [Vite Dynamic Import Convention](#vite-dynamic-import-convention).
4. **No auto-start** — Ensure `init()` does not set `isPlaying = true`; the initial state must have `isPlaying: false`. The same applies to `reset()`. Use `handleKeydownTransition` from `src/games/shared/gameHelpers.js` for three-way keyboard state transitions (see [Game Initialization](#game-initialization)).
5. **Initial tests** — Create `tests/games/<slug>.test.js` with Vitest tests covering required exports exist, `init()` returns correct initial state (`score=0`, `isGameOver=false`, `isPlaying=false`), `reset()` restores initial state, `handleKeydown()` triggers three-way logic, and `update()`/`render()` don't crash. See [Testing Conventions](#testing-conventions).
6. **Verify** — Run `node scripts/verify-game-exists.js <slug>` to confirm both the game code directory and test file exist before considering the game added. See [Pre-implementation Verification](#pre-implementation-verification).

## Scope Discipline

When the card's spec is fully implemented and all acceptance criteria are met, submit the card. Do not continue making unrequested changes beyond what the card asked for, even if they seem related, helpful, or obviously worthwhile improvements.

The instinct to fix things "while I'm at it" is natural — you spot a typo, refactor a confusing bit of code, or clean up a test. That impulse is good in general. Inside the discipline of a card, though, it's counterproductive. Each card is a focused unit of work with a defined spec and acceptance criteria. Adding unrelated changes expands the scope, which means longer reviews, more eyes on things nobody asked you to touch, and more chances for a reviewer to flag something irrelevant to the actual task.

When you uncover an unrelated issue during implementation, note it for a separate card rather than fixing it in the current one. Create a brief note in the card comments or the backlog so someone can pick it up later with its own scope.

**Consequences of violation:** Scope creep on cards leads to longer review cycles, more revision rounds, and ultimately more time spent discussing unrequested changes than would have been spent writing a separate card. Correct, spec-compliant code gets bounced back through multiple revision cycles because reviewers have to evaluate the unrequested changes, creating delay and frustration for everyone involved. The right fix for the issue you noticed will happen — on its own card, with its own focused review — rather than getting lost in a larger diff.

## Last Reviewed

- **Reviewed:** 2026-01-04
- **Scope:** Game Initialization convention — confirmed accurate following auto-start fix across Snake, Tetris, and Breakout.
- **Verified sections:** Short-circuit assertions (||) anti-pattern (lines 183-206), game initialization conventions (lines 71-117).
- **Excluded:** None.
- **Note:** Auto-start regression fixes verified in Snake, Tetris, and Breakout unit tests. Card revision confirmed spec compliance.
- **Verified sections:** Game Initialization section (lines 71-226), including three-way state transitions with handleKeydownTransition helper pattern.
- **Acceptance criteria verified:** Date updated to 2026-01-04, Scope mentions Game Initialization convention accuracy after auto-start fixes in Snake, Tetris, and Breakout.

## Writing Conventions

This document (AGENTS.md) is a living guide for humans — including LLMs acting in a human role — working on the gameShelf project. It captures conventions learned from real work, not theoretical rules. Treat it the way a senior developer would treat a well-maintained runbook: practical, grounded in experience, and focused on helping people do the right thing without overthinking it.

**Write human-readable conventions, not tool instructions.** Avoid language that reads like a spec for a parser or a directive to an AI agent. Phrases like "strip the entire line", "the system should remove", or block-quoted commands telling a tool what to do belong in engineering documentation, not in project conventions written for people. Frame everything as guidance a human would follow — "When you see X, do Y" rather than "The linter will remove X."

**Avoid redundant intermediate subsections.** Don't split content into multiple sub-headers that say the same thing in slightly different words. The Card-Level Postmortems cleanup is the canonical example: the original section had separate "### No-friction cards" and "### When friction *did* occur" subsections, both covering the same postmortem structure. Consolidate into a single, clear section with examples. Each subsection should cover genuinely distinct content — if two headers are just rephrasing the same rule, merge them.

**Reframe do/don't patterns as human writing conventions.** When documenting anti-patterns and best practices, describe how to write things well rather than describing what a tool should check or prevent. Instead of "Remove the struggles section when empty," write "Omit the struggles section entirely for clean cards" — it's the same guidance, but the latter reads like advice from a colleague and carries the same instruction without invoking a tool metaphor. This applies everywhere in the document: describe the right way to write code, tests, or documentation, not the mechanical steps a system takes to enforce it.
