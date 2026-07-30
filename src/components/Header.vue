<script setup>
defineProps({
  activeFilter: {
    type: String,
    default: 'all'
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['filter-change', 'search-change'])

const categories = [
  { name: 'All', value: 'all' },
  { name: 'Action', value: 'action' },
  { name: 'Puzzle', value: 'puzzle' },
  { name: 'Arcade', value: 'arcade' },
  { name: 'Strategy', value: 'strategy' },
  { name: 'Board', value: 'board' },
  { name: 'Casual', value: 'casual' }
]

function handleFilter(categoryValue) {
  emit('filter-change', categoryValue)
}

function handleSearch(event) {
  emit('search-change', event.target.value)
}
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <router-link to="/" class="logo">gameShelf</router-link>
      <nav class="category-bar">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="filter-btn"
          :class="{ active: activeFilter === cat.value }"
          @click="handleFilter(cat.value)"
        >
          {{ cat.name }}
        </button>
      </nav>
      <div class="search-area">
        <input
          type="text"
          class="search-input"
          placeholder="Search games..."
          :value="searchQuery"
          @input="handleSearch"
        />
      </div>
    </div>
  </header>
</template>
