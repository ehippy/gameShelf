<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const id = route.params.id
</script>

<template>
  <div>
    <h1>Game: {{ id }}</h1>
    <p>Loading game...</p>
  </div>
</template>
