import axios from 'axios';
import { setupAuthInterceptors } from './authInterceptor';
const isProd = import.meta.env.PROD;
const LOGIN_API_URL = isProd ? '/api/login' : 'http://localhost:3000';
const LOBBY_API_URL = isProd ? '/api/lobby' : 'http://localhost:3001';
const GAMEPLAY_API_URL = isProd ? '/api/gameplay' : 'http://localhost:3002';
const STATS_API_URL = isProd ? '/api/stats' : 'http://localhost:3003';
const createInstance = (url) => {
    const instance = axios.create({
        baseURL: url,
        withCredentials: true
    });
    setupAuthInterceptors(instance);
    return instance;
};

const loginApi = createInstance(LOGIN_API_URL);
const lobbyApi = createInstance(LOBBY_API_URL);
const gameplayApi = createInstance(GAMEPLAY_API_URL);
const statsApi = createInstance(STATS_API_URL);

export { loginApi, lobbyApi, gameplayApi, statsApi, LOGIN_API_URL, LOBBY_API_URL, GAMEPLAY_API_URL, STATS_API_URL };