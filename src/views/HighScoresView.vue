<template>
  <div>
    <h1>High Scores</h1>
    <table class="high-scores-table" v-if="hasScores">
      <thead>
        <tr>
          <th>Game</th>
          <th>Name</th>
          <th>Score</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="score in allScores" :key="score.key">
          <td>{{ score.gameName }}</td>
          <td>{{ score.name }}</td>
          <td>{{ score.score }}</td>
          <td>{{ score.date }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No high scores yet.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useScoreStore } from '../stores/scoreStore.js'
import { useGameStore } from '../stores/gameStore.js'

const scoreStore = useScoreStore()
const gameStore = useGameStore()

const allScores = computed(() => {
  const entries = []
  for (const [gameId, scores] of Object.entries(scoreStore.highScores)) {
    if (scores.length === 0) continue
    const game = gameStore.getGameById(gameId)
    const gameName = game ? game.name : gameId
    for (const s of scores) {
      entries.push({
        key: `${gameId}-${s.date}`,
        gameName,
        name: s.name,
        score: s.score,
        date: new Date(s.date).toLocaleDateString()
      })
    }
  }
  return entries
})

const hasScores = computed(() => allScores.value.length > 0)
</script>
