<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useGameCatalogStore } from '../stores/gameCatalog'
import GameCard from '../components/GameCard.vue'

const store = useGameCatalogStore()

// 4 slides with 5 game hrefs each (from index.html carousel structure)
const slides = [
  ['snake.html', 'tetris.html', '2048.html', 'breakout.html', 'pacman.html'],
  ['pacman.html', 'minesweeper.html', 'tictactoe.html', 'memorymatch.html', 'simon-says.html'],
  ['whackamole.html', 'snake.html', 'tetris.html', 'breakout.html', '2048.html'],
  ['2048.html', 'pacman.html', 'memorymatch.html', 'minesweeper.html', 'simon-says.html']
]

const currentIndex = ref(0)
const autoAdvance = ref(true)
let intervalId = null

// Check reduced motion preference
const prefersReducedMotion = ref(false)

function checkReducedMotion() {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function startAutoAdvance() {
  if (!autoAdvance.value) return
  stopAutoAdvance()
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % slides.length
  }, 6000)
}

function stopAutoAdvance() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function goToSlide(index) {
  currentIndex.value = index
  stopAutoAdvance()
  startAutoAdvance()
}

function onHoverIn() {
  stopAutoAdvance()
}

function onHoverOut() {
  startAutoAdvance()
}

function getGameByHref(href) {
  return store.games.find(g => g.href === href)
}

onMounted(() => {
  checkReducedMotion()

  // Listen for changes to reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', checkReducedMotion)
  } else if (mediaQuery.addListener) {
    // Fallback for older browsers
    mediaQuery.addListener(checkReducedMotion)
  }

  // Only start auto-advance if reduced motion is NOT preferred
  if (!prefersReducedMotion.value) {
    startAutoAdvance()
  }
})

onUnmounted(() => {
  stopAutoAdvance()
})
</script>

<template>
  <section class="most-played-section">
    <div class="section-header">
      <h2>Most Played</h2>
      <span class="shuffle-indicator" aria-label="Carousel auto-advances">↻</span>
    </div>
    <div
      class="carousel-wrapper"
      @mouseenter="onHoverIn"
      @mouseleave="onHoverOut"
    >
      <div class="carousel-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div
          v-for="(slide, slideIndex) in slides"
          :key="slideIndex"
          class="carousel-slide"
        >
          <template v-for="(href, idx) in slide" :key="idx">
            <GameCard
              v-if="getGameByHref(href)"
              :game="getGameByHref(href)"
            />
          </template>
        </div>
      </div>
      <div class="carousel-dots">
        <button
          v-for="(_, i) in slides"
          :key="i"
          class="carousel-dot"
          :class="{ active: currentIndex === i }"
          @click="goToSlide(i)"
          :aria-label="`Show slide ${i + 1}`"
        />
      </div>
    </div>
  </section>
</template>
