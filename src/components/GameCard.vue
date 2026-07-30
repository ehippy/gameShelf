<script setup>
defineProps({
  game: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <router-link :to="'/games/' + game.href" class="game-card">
    <div class="card-thumb" :style="{ background: game.gradient }">
      <span class="thumb-icon">{{ game.icon }}</span>
    </div>
    <div class="card-info">
      <h3>{{ game.name }}</h3>
      <p class="card-desc">{{ game.description }}</p>
      <span class="card-tag" :class="game.category">{{ game.category }}</span>
    </div>
    <div class="card-play">▶ Play</div>
  </router-link>
</template>
