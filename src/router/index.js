import Vue from 'vue';
import VueRouter from 'vue-router';
import HomeView from '../views/HomeView.vue';
import GamePage from '../views/GamePage.vue';
import LoungeView from '../views/LoungeView.vue';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/game',
    name: 'game',
    component: GamePage
  },
  {
    path: '/lounge',
    name: 'lounge',
    component: LoungeView
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
