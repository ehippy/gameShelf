import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    lastPlayedGame: null
  }),
  actions: {
    setUserName(name) {
      this.username = name
    },
    setLastPlayedGame(gameId) {
      this.lastPlayedGame = gameId
    }
  }
})
