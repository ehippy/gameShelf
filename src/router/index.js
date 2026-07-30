import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'

// Vue Router configuration for gameShelf SPA
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../pages/About.vue')
  },
  {
    path: '/games/:id',
    name: 'game',
    component: () => import('../pages/GamePlayer.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
