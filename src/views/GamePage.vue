<template>
  <div>
    <h1>{{ game?.name || 'Game' }}</h1>
    <div class="game-placeholder">Game canvas coming soon</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGameStore } from '../stores/gameStore.js'

const route = useRoute()
const gameStore = useGameStore()

const game = computed(() => gameStore.getGameById(route.params.id))
</script>
