import { computed } from 'vue'
import { defineStore } from 'pinia'
import gamesCatalog from '../data/gamesCatalog.js'

export const useGameStore = defineStore('game', {
  state: () => ({
    catalog: [...gamesCatalog],
    activeGame: null,
    searchQuery: '',
    selectedCategory: ''
  }),
  computed: {
    gamesByCategory(category) {
      const lower = category.toLowerCase()
      return this.catalog.filter(g => g.category.toLowerCase() === lower)
    }
  },
  getters: {
    newestGames: (state) => {
      return state.catalog.slice(-3).reverse()
    }
  },
  actions: {
    getGameBySlug(slug) {
      return this.catalog.find(g => g.slug === slug)
    },
    setActiveGame(slug) {
      this.activeGame = slug
    },
    addGame(game) {
      this.catalog.push(game)
    },
    removeGame(slug) {
      this.catalog = this.catalog.filter(g => g.slug !== slug)
      if (this.activeGame === slug) {
        this.activeGame = null
      }
    }
  }
})
