<template>
  <div>
    <h1>gameShelf</h1>
    <p class="tagline">Play classic games right in your browser</p>
    <div class="games-grid">
      <GameCard
        v-for="game in gameStore.catalog"
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
import { useGameStore } from '../stores/gameStore.js'
import GameCard from './GameCard.vue'

const gameStore = useGameStore()
</script>
