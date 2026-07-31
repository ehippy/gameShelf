<template>
  <div class="game-card">
    <div class="game-card-thumbnail">
      <img v-if="thumbnail" :src="thumbnail" :alt="title" />
    </div>
    <h3 class="game-card-title">{{ title }}</h3>
    <p class="game-card-description">{{ description }}</p>
    <span class="game-card-category">{{ category }}</span>
    <router-link class="game-card-play" :to="'/game/' + slug">Play</router-link>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  category: { type: String, required: true },
  slug: { type: String, required: true }
})
</script>

<style scoped>
.game-card {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-bg-tertiary);
  border-radius: 8px;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  transition: transform 0.2s, border-color 0.2s;
}

.game-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-accent);
}

.game-card-thumbnail {
  width: 100%;
  height: 140px;
  background-color: var(--color-bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.game-card-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.game-card-title {
  color: var(--color-accent);
  font-size: 1.25rem;
  margin: 0;
}

.game-card-description {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.game-card-category {
  display: inline-block;
  background-color: var(--color-bg-tertiary);
  color: var(--color-accent);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.game-card-play {
  display: inline-block;
  background-color: var(--color-accent);
  color: #ffffff;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  text-align: center;
  margin-top: auto;
  transition: background-color 0.2s;
}

.game-card-play:hover {
  background-color: var(--color-accent-hover);
}
</style>
