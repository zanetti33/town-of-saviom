import axios from 'axios';
import { io } from 'socket.io-client';
import { setupAuthInterceptors } from './authInterceptor';
const isProd = process.env.PROD === 'true';
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

const lobbySocket = (accessToken) => {
    return isProd ?
        io('/', {
            path: LOBBY_API_URL + "/socket.io",
            auth: { token: accessToken },
            query: { token: accessToken },
            withCredentials: true,
            reconnection: false
        }) :
        io(LOBBY_API_URL, {
            auth: { token: accessToken },
            withCredentials: true,
            reconnection: false
        });
}

const gameplaySocket = (accessToken, gameId) => {
    return isProd ?
        io('/', {
            path: GAMEPLAY_API_URL + "/socket.io",
            auth: { token: accessToken },
            query: { gameId: gameId, token: accessToken },
            withCredentials: true,
            reconnection: false
        }) :
        io(GAMEPLAY_API_URL, {
            auth: { token: accessToken },
            query: { gameId: gameId },
            withCredentials: true,
            reconnection: false
        });
}

export { loginApi, lobbyApi, gameplayApi, statsApi, LOGIN_API_URL, LOBBY_API_URL, GAMEPLAY_API_URL, STATS_API_URL, lobbySocket, gameplaySocket };