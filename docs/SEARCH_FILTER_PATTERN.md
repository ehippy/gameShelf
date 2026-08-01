# Search / Filter UI Pattern

This document describes the established pattern for UI-driven list filtering in gameShelf.
It covers state ownership, UI binding, computed filtering, and logic rules.

---

## 1. State Ownership

The `gameStore` (defined in `src/stores/gameStore.js`) owns two reactive state properties:

| Property            | Type   | Default | Purpose                                |
| ------------------- | ------ | ------- | -------------------------------------- |
| `searchQuery`       | string | `''`    | The text the user typed into the search |
| `selectedCategory`  | string | `''`    | The category the user selected          |

These are plain reactive fields on the Pinia store — no mutations or actions are needed to
read or write them. Any component that calls `useGameStore()` gets direct access.

---

## 2. UI Binding in `AppHeader.vue`

The `AppHeader` component (`src/components/AppHeader.vue`) renders two input elements and
binds them directly to the store properties:

**Search input** — two-way binding via `:value` + `@input`:

```html
<input
  type="text"
  placeholder="Search games..."
  class="search-input"
  :value="gameStore.searchQuery"
  @input="gameStore.searchQuery = $event.target.value"
>
```

**Category select** — two-way binding via `:value` + `@change`:

```html
<select
  class="category-filter"
  :value="gameStore.selectedCategory"
  @change="gameStore.selectedCategory = $event.target.value"
>
  <option value="">All Categories</option>
  <option value="Arcade">Arcade</option>
  <option value="Puzzle">Puzzle</option>
  <option value="Action">Action</option>
</select>
```

When the user types or selects, the store property is updated immediately. Because Pinia
reactivity is reactive, `HomeView`'s computed property reacts automatically.

---

## 3. Computed Filtering in `HomeView.vue`

The `HomeView` component (`src/views/HomeView.vue`) defines a `filteredGames` computed
property that chains two filters:

```js
const filteredGames = computed(() => {
  let results = gameStore.catalog

  // Filter 1 — text search (OR across fields)
  if (gameStore.searchQuery) {
    const q = gameStore.searchQuery.toLowerCase()
    results = results.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q)
    )
  }

  // Filter 2 — category (exact match)
  if (gameStore.selectedCategory) {
    const cat = gameStore.selectedCategory.toLowerCase()
    results = results.filter(g => g.category.toLowerCase() === cat)
  }

  return results
})
```

The template then renders `GameCard` components for each game in `filteredGames`:

```html
<div class="games-grid">
  <GameCard
    v-for="game in filteredGames"
    :key="game.slug"
    :slug="game.slug"
    :title="game.title"
    :description="game.description"
    :thumbnail="game.thumbnail"
    :category="game.category"
  />
</div>
```

---

## 4. Case-Insensitive Matching

All comparisons are case-insensitive:

- **Search text**: The original value of `gameStore.searchQuery` is preserved in the store
  unchanged. Lowercasing is done only at comparison time (`gameStore.searchQuery.toLowerCase()`).
- **Fields**: Each game field (`title`, `description`, `category`) is lowercased before
  comparison (`g.title.toLowerCase()`).
- **Category select**: The selected category string is also lowercased on both sides before
  the exact-equal check (`g.category.toLowerCase() === cat`).

This means a user can type `SNAKE`, `Snake`, or `snake` and get identical results.

---

## 5. Logic: OR Within Search, AND Between Filters

The filtering logic uses two levels:

| Level                       | Logic | Details                                                         |
| --------------------------- | ----- | --------------------------------------------------------------- |
| **Within text search**      | **OR**  | A game matches the search query if **any** of title, description, or category contains the query (case-insensitive). |
| **Between filters**         | **AND** | If both `searchQuery` and `selectedCategory` are non-empty, a game must satisfy **both** filters to appear in results. |

Each filter is applied sequentially. When a filter property is an empty string (`''`), that
filter is skipped entirely, so only the active filter(s) apply.

---

## 6. Living Specification: `tests/filtering.test.js`

The file `tests/filtering.test.js` is the comprehensive, executable specification of this
pattern. It contains:

- Unit tests for the filtering logic (search, category, combined, edge cases).
- Integration tests that mount `HomeView` and `AppHeader` against a real Pinia store,
  verifying reactivity and binding correctness.

Future agents should consult **both** this document and the test file: the doc explains
the *what* and *why*, the tests define the exact *behavior* in machine-checkable form.

```
npm test   # runs Vitest, including tests/filtering.test.js
```

---

## 7. Current State Note

The category options in `AppHeader.vue` are currently **hardcoded**:

```html
<option value="All Categories">All Categories</option>
<option value="Arcade">Arcade</option>
<option value="Puzzle">Puzzle</option>
<option value="Action">Action</option>
```

The pattern is fully compatible with **dynamic category generation** from
`gameStore.catalog` in the future. When that enhancement is made, the `<select>` could map
over `gameStore.catalog.map(g => g.category)` (with duplicates removed) instead of relying
on static options. No changes to `gameStore` or `HomeView` would be needed.

---

## 8. Pipeline Summary

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
