import axios from 'axios';

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:5000';

const authApi = axios.create({
  baseURL: `${AUTH_BASE_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  register: (data) => authApi.post('/register', data),
  login: (email, password) => authApi.post('/login', { email, password }),
  getProfile: (token) => authApi.get('/profile', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  loginWithGithub: () => {
    window.location.href = `${AUTH_BASE_URL}/api/auth/github`;
  },
  loginWithGoogle: () => {
    window.location.href = `${AUTH_BASE_URL}/api/auth/google`;
  }
};