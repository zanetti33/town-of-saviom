import axios from 'axios';
import { setupAuthInterceptors } from './authInterceptor';
const LOGIN_API_URL = 'http://localhost:3000';
const LOBBY_API_URL = 'http://localhost:3001';
const GAMEPLAY_API_URL = 'http://localhost:3002';
const STATS_API_URL = 'http://localhost:3003';

const loginApi = axios.create({
    baseURL: LOGIN_API_URL,
    withCredentials: true
});

setupAuthInterceptors(loginApi);

const lobbyApi = axios.create({
    baseURL: LOBBY_API_URL,
    withCredentials: true
});

setupAuthInterceptors(lobbyApi);

const gameplayApi = axios.create({
    baseURL: GAMEPLAY_API_URL,
    withCredentials: true
});

setupAuthInterceptors(gameplayApi);

const statsApi = axios.create({
    baseURL: STATS_API_URL,
    withCredentials: true
});

setupAuthInterceptors(statsApi);

export { loginApi, lobbyApi, gameplayApi, statsApi, LOGIN_API_URL, LOBBY_API_URL, GAMEPLAY_API_URL, STATS_API_URL };