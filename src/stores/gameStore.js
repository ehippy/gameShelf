import { defineStore } from 'pinia'
import gamesCatalog from '../data/gamesCatalog.js'

export const useGameStore = defineStore('game', {
  state: () => ({
    catalog: [...gamesCatalog],
    activeGame: null
  }),
  actions: {
    addGame(game) {
      this.catalog.push(game)
    },
    removeGame(id) {
      this.catalog = this.catalog.filter(g => g.id !== id)
      if (this.activeGame === id) {
        this.activeGame = null
      }
    },
    getGameById(id) {
      return this.catalog.find(g => g.id === id)
    },
    setActiveGame(id) {
      this.activeGame = id
    }
  }
})
