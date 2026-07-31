import { defineStore } from 'pinia'

function loadRecentlyPlayed() {
  try {
    const raw = localStorage.getItem('user_recentlyPlayed')
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // ignore
  }
  return []
}

function saveRecentlyPlayed(arr) {
  localStorage.setItem('user_recentlyPlayed', JSON.stringify(arr))
}

export const useUserStore = defineStore('user', {
  state: () => ({
    recentlyPlayed: loadRecentlyPlayed()
  }),
  actions: {
    markPlayed(slug) {
      const idx = this.recentlyPlayed.indexOf(slug)
      if (idx !== -1) {
        this.recentlyPlayed.splice(idx, 1)
      }
      this.recentlyPlayed.push(slug)
      if (this.recentlyPlayed.length > 8) {
        this.recentlyPlayed.shift()
      }
      saveRecentlyPlayed(this.recentlyPlayed)
    },
    getRecentlyPlayed() {
      return this.recentlyPlayed
    }
  }
})
