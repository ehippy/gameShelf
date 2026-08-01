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
