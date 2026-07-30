<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const gameId = computed(() => route.params.id || '')

const gameName = computed(() => {
  if (!gameId.value) return 'Game'
  return gameId.value.replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
})

const iframeSrc = computed(() => gameId.value ? `games/${gameId.value}` : '')

const isValidGame = computed(() => {
  return gameId.value && gameId.value.endsWith('.html')
})

const hasError = computed(() => !isValidGame.value)

function onIframeError() {
  // Trigger error display if iframe fails to load
  const iframe = document.querySelector('.game-iframe')
  if (iframe && iframe.contentDocument && !iframe.src) {
    // Already handled by template logic
  }
}
</script>

<template>
  <div class="page-game">
    <div class="game-player-inner">
      <router-link to="/" class="back-link">← Back to Home</router-link>
      <div class="game-frame-container">
        <iframe
          v-if="!hasError"
          :src="iframeSrc"
          :title="gameName"
          class="game-iframe"
          @error="onIframeError"
        ></iframe>
        <div v-else class="error-container">
          <h2>Game not found</h2>
          <p>The game you're looking for doesn't exist or couldn't be loaded.</p>
          <router-link to="/" class="back-link">← Back to Home</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-game {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.game-player-inner {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.back-link {
  display: inline-block;
  color: var(--accent);
  font-size: 0.95rem;
  font-weight: 600;
  padding: var(--spacing-md) var(--spacing-lg);
  transition: color var(--transition-normal);
}

.back-link:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

.game-frame-container {
  flex: 1;
  min-height: 0;
  position: relative;
}

.game-iframe {
  width: 100%;
  height: calc(100vh - 120px);
  border: none;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 120px);
  color: var(--text-primary);
  text-align: center;
  gap: var(--spacing-md);
}

.error-container h2 {
  font-size: 1.5rem;
  color: var(--accent);
}

.error-container p {
  color: var(--text-secondary);
}
</style>
