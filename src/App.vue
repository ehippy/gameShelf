<script setup>
import { useGameCatalogStore } from './stores/gameCatalog'
const store = useGameCatalogStore()
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>
