<template>
  <div>
    <h1>gameShelf</h1>
    <p class="tagline">Play classic games right in your browser</p>
    <div class="games-grid">
      <router-link
        v-for="game in gameStore.catalog"
        :key="game.id"
        :to="`/game/${game.id}`"
        class="game-card"
      >
        <h3>{{ game.name }}</h3>
        <p>{{ game.description }}</p>
        <span class="genre">{{ game.genre }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore.js'

const gameStore = useGameStore()
</script>
