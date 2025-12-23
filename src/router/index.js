import { createRouter, createWebHistory } from 'vue-router';
// Import your components
import LoginContainer from '../components/LoginContainer.vue';
import DashboardContainer from '../components/DashboardContainer.vue';
import RoomList from '../components/RoomList.vue';
import RoomContainer from '../components/RoomContainer.vue';
import NotFound from '../pages/NotFound.vue';

const routes = [
  { path: '/dashboard', component: DashboardContainer, name: 'Dashboard' },
  { path: '/login', component: LoginContainer, name: 'Login' },
  { path: '/rooms', component: RoomList, name: 'RoomList' },
  { path: '/rooms/:id', component: RoomContainer, name: 'Room' },
  // Always at the end, match everything else
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;