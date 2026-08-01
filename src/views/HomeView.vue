<template>
  <div>
    <h1>gameShelf</h1>
    <p class="tagline">Play classic games right in your browser</p>
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore.js'
import GameCard from '../components/GameCard.vue'

const gameStore = useGameStore()

const filteredGames = computed(() => {
  let results = gameStore.catalog
  if (gameStore.searchQuery) {
    const q = gameStore.searchQuery.toLowerCase()
    results = results.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q)
    )
  }
  if (gameStore.selectedCategory) {
    const cat = gameStore.selectedCategory.toLowerCase()
    results = results.filter(g => g.category.toLowerCase() === cat)
  }
  return results
})
</script>
