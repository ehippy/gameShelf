<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameCatalogStore } from '../stores/gameCatalog'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import GameCard from '../components/GameCard.vue'
import MostPlayedCarousel from '../components/MostPlayedCarousel.vue'

const store = useGameCatalogStore()
const router = useRouter()

const activeFilter = ref('all')
const searchQuery = ref('')

const filteredGames = computed(() => {
  let games = store.games
  if (activeFilter.value !== 'all') {
    games = games.filter(g => g.category === activeFilter.value)
  }
  if (searchQuery.value.trim()) {
    games = store.searchGames(searchQuery.value)
    // Also filter by category after search
    if (activeFilter.value !== 'all') {
      games = games.filter(g => g.category === activeFilter.value)
    }
  }
  return games
})

function handleFilterChange(filter) {
  activeFilter.value = filter
}

function handleSearchChange(query) {
  searchQuery.value = query
}

function randomGame() {
  const games = store.games
  if (games.length === 0) return
  const randomIndex = Math.floor(Math.random() * games.length)
  const href = games[randomIndex].href
  router.push('/games/' + href)
}
</script>

<template>
  <div class="home-page">
    <Header
      :active-filter="activeFilter"
      :search-query="searchQuery"
      @filter-change="handleFilterChange"
      @search-change="handleSearchChange"
    />

    <MostPlayedCarousel />

    <div class="random-game-btn-area">
      <button class="random-btn" @click="randomGame">🎲 Random Game</button>
    </div>

    <section class="what-new-section">
      <h2>What's New</h2>
      <ul class="what-new-list">
        <li class="what-new-item">
          <span class="what-new-date">June 5, 2025</span>
          <span class="what-new-tag new">New</span>
          <span class="what-new-desc">Added Sliding Tile Puzzle — slide numbered tiles to arrange them in order!</span>
        </li>
        <li class="what-new-item">
          <span class="what-new-date">June 4, 2025</span>
          <span class="what-new-tag new">New</span>
          <span class="what-new-desc">Added Space Invaders — the classic arcade shooter with escalating alien waves.</span>
        </li>
        <li class="what-new-item">
          <span class="what-new-date">June 3, 2025</span>
          <span class="what-new-tag new">New</span>
          <span class="what-new-desc">Added Simon Says — a colorful memory game where you repeat growing sequences.</span>
        </li>
        <li class="what-new-item">
          <span class="what-new-date">June 2, 2025</span>
          <span class="what-new-tag new">New</span>
          <span class="what-new-desc">Added Memory Match — a card-flipping puzzle game.</span>
        </li>
        <li class="what-new-item">
          <span class="what-new-date">June 1, 2025</span>
          <span class="what-new-tag new">New</span>
          <span class="what-new-desc">Added Tic Tac Toe with smart AI opponent.</span>
        </li>
      </ul>
    </section>

    <section class="games-section">
      <div class="section-header">
        <h2>All Games</h2>
      </div>
      <div class="games-grid">
        <GameCard
          v-for="game in filteredGames"
          :key="game.href"
          :game="game"
        />
      </div>
    </section>

    <Footer />
  </div>
</template>
