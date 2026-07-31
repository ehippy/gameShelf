<template>
  <button class="random-game-btn" @click="pickRandom">
    🎲 Play Random Game
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore.js'

const router = useRouter()
const gameStore = useGameStore()

function pickRandom() {
  const games = gameStore.catalog
  if (games.length === 0) return
  const randomGame = games[Math.floor(Math.random() * games.length)]
  router.push('/game/' + randomGame.id)
}
</script>

<style scoped>
.random-game-btn {
  background-color: var(--color-accent);
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.random-game-btn:hover {
  background-color: var(--color-accent-hover);
}
</style>
