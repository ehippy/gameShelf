<template>
  <header class="app-header">
    <h1 class="brand">gameShelf</h1>
    <div class="header-center">
      <input type="text" placeholder="Search games..." class="search-input">
      <select class="category-filter">
        <option value="">All Categories</option>
        <option value="Arcade">Arcade</option>
        <option value="Puzzle">Puzzle</option>
        <option value="Action">Action</option>
      </select>
    </div>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/">Games</router-link>
      <router-link to="/highscores">High Scores</router-link>
      <router-link to="/about">About</router-link>
    </nav>
  </header>
</template>

<script setup>
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-bg-tertiary);
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-accent);
  letter-spacing: 1px;
  margin: 0;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  justify-content: center;
  min-width: 200px;
}

.search-input,
.category-filter {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-bg-tertiary);
  color: var(--color-text-primary);
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input {
  width: 180px;
}

.category-filter {
  cursor: pointer;
}

.app-header nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.app-header nav a {
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.app-header nav a:hover,
.app-header nav a.router-link-active {
  color: var(--color-accent);
}
</style>
