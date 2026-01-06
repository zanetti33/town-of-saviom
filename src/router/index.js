import { createRouter, createWebHistory } from 'vue-router';
// Import your components
import LoginContainer from '../components/LoginContainer.vue';
import LogoutContainer from '../components/LogoutContainer.vue';
import DashboardContainer from '../components/DashboardContainer.vue';
import RoomList from '../components/RoomList.vue';
import RoomContainer from '../components/RoomContainer.vue';
import CreateRoom from '../components/CreateRoom.vue';
import RegisterContainer from '../components/RegisterContainer.vue';
import OptionsContainer from '../components/OptionsContainer.vue';
import GameContainer from '../components/GameContainer.vue';

const routes = [
  { path: '/dashboard', component: DashboardContainer, name: 'Dashboard' },
  { path: '/login', component: LoginContainer, name: 'Login' },
  { path: '/register', component: RegisterContainer, name: 'Register' },
  { path: '/logout', component: LogoutContainer, name: 'Logout' },
  { path: '/rooms', component: RoomList, name: 'RoomList' },
  { path: '/rooms/:id', component: RoomContainer, name: 'Room' },
  { path: '/rooms/create', component: CreateRoom, name: 'CreateRoom' },
  { path: '/games/:id', component: GameContainer, name: 'Game' },
  { path: '/options', component: OptionsContainer, name: 'Options'},
  // Always at the end, match everything else
  // dashboard if logged, otherwise redirected to login
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;