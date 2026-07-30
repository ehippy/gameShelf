import { defineStore } from 'pinia'

export const useScoreStore = defineStore('score', {
  state: () => ({
    highScores: {
      snake: [],
      tetris: [],
      breakout: []
    }
  }),
  actions: {
    addScore(gameId, name, score) {
      if (!this.highScores[gameId]) {
        this.highScores[gameId] = []
      }
      this.highScores[gameId].push({
        name,
        score,
        date: new Date().toISOString()
      })
    },
    getHighScores(gameId) {
      return this.highScores[gameId] || []
    },
    clearScores(gameId) {
      this.highScores[gameId] = []
    }
  }
})
