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

The pre-commit hook (`scripts/check-assertion-dupes.js`, run via `.husky/pre-commit`) serves as the first line of defense, surfacing copy-pasted assertion patterns before manual tracing is needed. When the hook flags identical `expect(...).toBe(X)` lines across consecutive `it()` blocks in the same `describe` scope, review whether the expected value was updated for each distinct test scenario.

After manual tracing through the expected behavior, ensure assertion values match reality, rather than assuming hardcoded numbers are correct.

**False-positive calibration:** The pre-commit script (`scripts/check-assertion-dupes.js`) requires 5 or more unique `it()` blocks sharing the exact same assertion line before it flags a problem. Two to four consecutive tests with the same assertion is always a legitimate coincidence — each test independently verifies an invariant (for example, both `init()` and `reset()` having `isPlaying` set to `false`). Don't second-guess the tool when it actually flags 5+ blocks, and don't dismiss it as unreliable when 2–4 blocks happen to share an assertion.

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

## Card-Level Postmortems

Card-level postmortems should only include friction/struggles details **when friction actually occurred** — during development, review, or deployment.

When a card completed cleanly, do not pad the postmortem with boilerplate substitutes like "Nothing notable", "None", "N/A", "No friction", "Clean card", "No struggles", or any variation of these. If there is nothing to report, the postmortem is simply the summary line — no struggle subsection at all, not even an empty one.

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

## Last Reviewed

- **Reviewed:** 2026-08-04
- **Scope:** Card-Level Postmortems section restructuring — removed tool-specific instructions, eliminated redundant subsection, reframed forbidden phrases as human writing convention.
- **Verified sections:** Card-Level Postmortems section (lines 304–324, post-cleanup).

- **Reviewed:** 2026-08-04
- **Scope:** Playwright E2E config and smoke test file — added `tests/e2e/smoke.spec.js` and Playwright config (`playwright.config.js`). Sandbox disk space blocked browser installation; the test file and config are structurally correct but not yet runnable.
- **Verified sections:** Last Reviewed section (lines 326–335, post-entry addition).

- **Reviewed:** 2026-08-04
- **Scope:** Route param naming convention — added 'Route param naming' subsection under 'Catalog & Routing Conventions' documenting that Vue Router route parameters must use `:slug`, not `:id`, for identifying games.
- **Verified sections:** Last Reviewed section (post-entry addition).

- **Reviewed:** 2026-08-05
- **Scope:** Testing Conventions — added 'Silent-pass guard clauses anti-pattern' subsection to the Vitest section, documenting the trap of early `return` statements between assertions.
- **Verified sections:** Silent-pass guard clauses anti-pattern subsection within Testing Conventions > Vitest (lines 229–278).

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

## Writing Conventions

This document (AGENTS.md) is a living guide for humans — including LLMs acting in a human role — working on the gameShelf project. It captures conventions learned from real work, not theoretical rules. Treat it the way a senior developer would treat a well-maintained runbook: practical, grounded in experience, and focused on helping people do the right thing without overthinking it.

**Write human-readable conventions, not tool instructions.** Avoid language that reads like a spec for a parser or a directive to an AI agent. Phrases like "strip the entire line", "the system should remove", or block-quoted commands telling a tool what to do belong in engineering documentation, not in project conventions written for people. Frame everything as guidance a human would follow — "When you see X, do Y" rather than "The linter will remove X."

**Avoid redundant intermediate subsections.** Don't split content into multiple sub-headers that say the same thing in slightly different words. The Card-Level Postmortems cleanup is the canonical example: the original section had separate "### No-friction cards" and "### When friction *did* occur" subsections, both covering the same postmortem structure. Consolidate into a single, clear section with examples. Each subsection should cover genuinely distinct content — if two headers are just rephrasing the same rule, merge them.

**Reframe do/don't patterns as human writing conventions.** When documenting anti-patterns and best practices, describe how to write things well rather than describing what a tool should check or prevent. Instead of "Remove the struggles section when empty," write "Omit the struggles section entirely for clean cards" — it's the same guidance, but the latter reads like advice from a colleague and carries the same instruction without invoking a tool metaphor. This applies everywhere in the document: describe the right way to write code, tests, or documentation, not the mechanical steps a system takes to enforce it.
