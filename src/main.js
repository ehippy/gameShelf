import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles.css'

// Handle GitHub Pages 404 fallback: strip hash from old redirect
const hash = window.location.hash.slice(2) // remove '#/'
if (hash) {
  router.push(hash)
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
