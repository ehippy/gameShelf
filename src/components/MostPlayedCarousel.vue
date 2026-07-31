<template>
  <div class="most-played-carousel">
    <h2>Most Played</h2>
    <div class="carousel-track">
      <GameCard
        v-for="slug in games"
        :key="slug"
        :title="gameStore.getGameBySlug(slug)?.title || slug"
        :description="gameStore.getGameBySlug(slug)?.description || ''"
        :category="gameStore.getGameBySlug(slug)?.category || 'Arcade'"
        :slug="slug"
      />
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore.js'
import GameCard from './GameCard.vue'

const gameStore = useGameStore()

defineProps({
  games: { type: Array, default: () => [] }
})
</script>

<style scoped>
.most-played-carousel {
  width: 100%;
  margin-bottom: var(--spacing-xl);
}

.most-played-carousel h2 {
  color: var(--color-accent);
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
}

.carousel-track {
  display: flex;
  overflow-x: auto;
  gap: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  scrollbar-width: thin;
  scrollbar-color: var(--color-bg-tertiary) transparent;
}

.carousel-track::-webkit-scrollbar {
  height: 6px;
}

.carousel-track::-webkit-scrollbar-track {
  background: transparent;
}

.carousel-track::-webkit-scrollbar-thumb {
  background-color: var(--color-bg-tertiary);
  border-radius: 3px;
}
</style>
