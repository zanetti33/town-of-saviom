import axios from 'axios';
import { setupAuthInterceptors } from './authInterceptor';
const LOGIN_API_URL = 'http://localhost:3000';
const LOBBY_API_URL = 'http://localhost:3001';

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

export { loginApi, lobbyApi, LOGIN_API_URL, LOBBY_API_URL };