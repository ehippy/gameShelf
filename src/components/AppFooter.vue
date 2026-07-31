<template>
  <footer class="app-footer">
    <p>&copy; 2025 gameShelf — All games built in browser — no downloads required</p>
    <router-link to="/about">About</router-link>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.app-footer {
  background-color: #1a1a2e;
  border-top: 1px solid #2a2a4a;
  padding: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: #666680;
}

.app-footer p {
  margin-bottom: 0.5rem;
}

.app-footer a {
  color: #7f5af0;
  text-decoration: none;
}

.app-footer a:hover {
  text-decoration: underline;
}
</style>
