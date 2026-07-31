<template>
  <div class="game-page">
    <h1>{{ game?.title || 'Game' }}</h1>

    <div class="game-container">
      <div class="game-info">
        <div class="info-box">
          <span class="info-label">Score</span>
          <span class="info-value">{{ state?.score ?? 0 }}</span>
        </div>
        <div class="info-box">
          <span class="info-label">Level</span>
          <span class="info-value">{{ state?.level ?? 1 }}</span>
        </div>
        <div class="info-box">
          <span class="info-label">Lines</span>
          <span class="info-value">{{ state?.lines ?? 0 }}</span>
        </div>
      </div>

      <div class="canvas-wrapper" ref="canvasWrapper" tabindex="0">
        <canvas ref="gameCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>

        <div v-if="state && state.isGameOver" class="game-over-overlay">
          <h2>Game Over</h2>
          <p>Score: {{ state.score }}</p>
          <button @click="playAgain">Play Again</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useGameStore } from '../stores/gameStore.js'
import { useScoreStore } from '../stores/scoreStore.js'

const route = useRoute()
const gameStore = useGameStore()
const scoreStore = useScoreStore()

const game = computed(() => gameStore.getGameBySlug(route.params.id))

const gameCanvas = ref(null)
let state = null

const canvasWidth = ref(250)
const canvasHeight = ref(200)

let gameLogic = null
let animFrameId = null
let lastSnapshotScore = null
let resizeObserver = null

onMounted(async () => {
  const slug = route.params.id
  // Dynamically import the game module
  gameLogic = await import(`../games/${slug}/gameLogic.js`)
  canvasWidth.value = gameLogic.CANVAS_WIDTH ?? 250
  canvasHeight.value = gameLogic.CANVAS_HEIGHT ?? 200

  const canvas = gameCanvas.value
  if (!canvas) return

  // Start the game
  gameLogic.init()
  state = reactive(gameLogic.state)

  // Keyboard handler
  const onKeyDown = (e) => {
    const key = e.key
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(key)) {
      e.preventDefault()
    }
    gameLogic.handleKeydown(key)

    // If game over and score hasn't been submitted yet, submit it
    if (state.isGameOver && lastSnapshotScore !== state.score && state.score > 0) {
      lastSnapshotScore = state.score
      scoreStore.submitScore(slug, state.score)
    }
  }
  window.addEventListener('keydown', onKeyDown)

  // Game loop
  const gameLoop = () => {
    if (gameLogic) {
      gameLogic.update()
      gameLogic.render(canvas)

      // Check for game over to submit score
      if (state.isGameOver && lastSnapshotScore !== state.score && state.score > 0) {
        lastSnapshotScore = state.score
        scoreStore.submitScore(slug, state.score)
      }
    }
    animFrameId = requestAnimationFrame(gameLoop)
  }
  animFrameId = requestAnimationFrame(gameLoop)

  // Cleanup on unmount
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
    }
  })
})

function playAgain() {
  if (gameLogic) {
    gameLogic.reset()
    state = reactive(gameLogic.state)
    lastSnapshotScore = null
  }
}
</script>

<style scoped>
.game-page {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.game-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.game-info {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.info-box {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-bg-tertiary);
  border-radius: 8px;
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.info-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.info-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-accent);
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  border: 2px solid var(--color-bg-tertiary);
  border-radius: 8px;
  overflow: hidden;
  outline: none;
}

.canvas-wrapper:focus {
  border-color: var(--color-accent);
}

.canvas-wrapper canvas {
  width: 100%;
  height: auto;
  display: block;
}

.game-over-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  border-radius: 8px;
}

.game-over-overlay h2 {
  color: #ff4444;
  font-size: 1.5rem;
}

.game-over-overlay p {
  color: #ffffff;
  font-size: 1.1rem;
}

.game-over-overlay button {
  background-color: var(--color-accent);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.game-over-overlay button:hover {
  background-color: var(--color-accent-hover);
}
</style>
