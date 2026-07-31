import { defineStore } from 'pinia'
import gamesCatalog from '../data/gamesCatalog.js'

const VALID_SLUG_RE = /^[a-z0-9-]+$/

function getKnownSlugs() {
  return new Set(gamesCatalog.map(g => g.slug))
}

function isValidSlug(slug) {
  return typeof slug === 'string' && VALID_SLUG_RE.test(slug) && getKnownSlugs().has(slug)
}

function loadScoresFromLocalStorage() {
  const scores = {}
  for (const game of gamesCatalog) {
    const key = `gamescore_${game.slug}`
    const raw = localStorage.getItem(key)
    try {
      scores[game.slug] = JSON.parse(raw || '[]')
    } catch {
      scores[game.slug] = []
    }
  }
  return scores
}

export const useScoreStore = defineStore('score', {
  state: () => ({
    scores: loadScoresFromLocalStorage()
  }),
  actions: {
    submitScore(gameSlug, score) {
      if (!isValidSlug(gameSlug)) return
      const key = `gamescore_${gameSlug}`
      const current = JSON.parse(localStorage.getItem(key) || '[]')
      current.push({ gameSlug, score, timestamp: new Date().toISOString() })
      localStorage.setItem(key, JSON.stringify(current))
      if (!this.scores[gameSlug]) {
        this.scores[gameSlug] = []
      }
      this.scores[gameSlug] = current
    },
    getScores(gameSlug) {
      const key = `gamescore_${gameSlug}`
      const raw = localStorage.getItem(key)
      try {
        const scores = JSON.parse(raw || '[]')
        return scores.sort((a, b) => b.score - a.score)
      } catch {
        return []
      }
    },
    getAllScores() {
      const all = []
      for (const game of gamesCatalog) {
        const key = `gamescore_${game.slug}`
        const raw = localStorage.getItem(key)
        try {
          const scores = JSON.parse(raw || '[]')
          all.push(...scores)
        } catch {
          // skip
        }
      }
      return all.sort((a, b) => b.score - a.score)
    },
    clearScores(gameSlug) {
      localStorage.removeItem(`gamescore_${gameSlug}`)
      this.scores[gameSlug] = []
    }
  }
})
