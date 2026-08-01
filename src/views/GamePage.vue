<template>
  <div class="game-page">
    <h1>{{ game?.title || 'Game' }}</h1>

    <div class="game-container">
      <div class="game-info">
        <div class="info-box">
          <span class="info-label">Score</span>
          <span class="info-value">{{ state?.score ?? 0 }}</span>
        </div>
        <div class="info-box" v-if="state?.level !== undefined">
          <span class="info-label">Level</span>
          <span class="info-value">{{ state?.level ?? 1 }}</span>
        </div>
        <div class="info-box" v-if="state?.lines !== undefined">
          <span class="info-label">Lines</span>
          <span class="info-value">{{ state?.lines ?? 0 }}</span>
        </div>
      </div>

      <div class="canvas-wrapper" ref="canvasWrapper" tabindex="0">
        <canvas ref="gameCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>

        <div v-if="state && (state.isGameOver || state.won)" class="game-over-overlay" :class="{ won: state.won }">
          <h2>{{ state.won ? 'You Won!' : 'Game Over' }}</h2>
          <p>Score: {{ state.score }}</p>
          <button @click="playAgain">Play Again</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore.js'
import { useScoreStore, isValidSlug } from '../stores/scoreStore.js'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const scoreStore = useScoreStore()

const game = computed(() => gameStore.getGameBySlug(route.params.id))

const gameCanvas = ref(null)
const canvasWrapper = ref(null)
let state = null

const canvasWidth = ref(250)
const canvasHeight = ref(200)

let gameLogic = null
let animFrameId = null
let lastSnapshotScore = null
let resizeObserver = null

onMounted(async () => {
  const slug = route.params.id
  const game = gameStore.getGameBySlug(slug)
  if (!game) {
    router.replace('/404')
    return
  }
  // Also verify the slug has a corresponding game directory (prevents
  // importing for slugs without a src/games/<slug>/gameLogic.js module)
  if (!isValidSlug(slug)) {
    router.replace('/404')
    return
  }
  // Dynamically import the game module
  gameLogic = await import('../games/' + slug + '/gameLogic.js')
  canvasWidth.value = gameLogic.CANVAS_WIDTH ?? 250
  canvasHeight.value = gameLogic.CANVAS_HEIGHT ?? 200

  const canvas = gameCanvas.value
  if (!canvas) return

  // Start the game
  gameLogic.init()
  state = reactive(gameLogic.state)

  // Score submission helper
  const submitScoreIfGameOver = () => {
    if ((state.isGameOver || state.won) && lastSnapshotScore !== state.score && state.score > 0) {
      lastSnapshotScore = state.score
      scoreStore.submitScore(slug, state.score)
    }
  }

  // Keyboard handler
  const onKeyDown = (e) => {
    const key = e.key
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(key)) {
      e.preventDefault()
    }
    gameLogic.handleKeydown(key)

    submitScoreIfGameOver()
  }
  window.addEventListener('keydown', onKeyDown)

  // Game loop
  const gameLoop = () => {
    if (gameLogic) {
      gameLogic.update()
      gameLogic.render(canvas)

      submitScoreIfGameOver()
    }
    animFrameId = requestAnimationFrame(gameLoop)
  }
  animFrameId = requestAnimationFrame(gameLoop)

  // Resize handler
  const wrapperEl = canvasWrapper.value
  if (wrapperEl) {
    resizeObserver = new ResizeObserver(() => {
      const availableHeight = window.innerHeight - 160
      const availableWidth = Math.min(window.innerWidth, 95 * window.innerWidth / 100)
      const scale_x = availableWidth / gameLogic.CANVAS_WIDTH
      const scale_y = availableHeight / gameLogic.CANVAS_HEIGHT
      const scale = Math.min(scale_x, scale_y)
      const displayWidth = Math.round(gameLogic.CANVAS_WIDTH * scale)
      const displayHeight = Math.round(gameLogic.CANVAS_HEIGHT * scale)
      canvas.style.width = `${displayWidth}px`
      canvas.style.height = `${displayHeight}px`
    })
    resizeObserver.observe(wrapperEl)
  }

  // Cleanup on unmount
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
    }
    if (resizeObserver) {
      resizeObserver.disconnect()
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
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  outline: none;
}

.canvas-wrapper canvas:focus {
  border-color: var(--color-accent);
}

.canvas-wrapper canvas {
  width: 100%;
  height: 100%;
  background-color: #0f0f23;
  border: 2px solid var(--color-bg-tertiary);
  border-radius: 8px;
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

.game-over-overlay.won h2 {
  color: #2ecc71;
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
