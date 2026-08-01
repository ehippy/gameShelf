<template>
  <div class="whats-new">
    <h2>What's New</h2>
    <div class="games-row">
      <GameCard
        v-for="game in gameStore.newestGames"
        :key="game.slug"
        :title="game.title"
        :description="game.description"
        :category="game.category"
        :slug="game.slug"
      />
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore.js'
import GameCard from './GameCard.vue'

const gameStore = useGameStore()
</script>

<style scoped>
.whats-new {
  width: 100%;
  margin-bottom: var(--spacing-xl);
}

.whats-new h2 {
  color: var(--color-accent);
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
}

.games-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}
</style>
