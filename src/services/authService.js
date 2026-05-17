import axios from 'axios';

// Instance Axios pour l'API Auth (port 5000)
const authApi = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  // Inscription
  register: (data) => authApi.post('/register', data),
  
  // Connexion
  login: (email, password) => authApi.post('/login', { email, password }),
  
  // Profil
  getProfile: (token) => authApi.get('/profile', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  
  // OAuth GitHub (redirige vers GitHub)
  loginWithGithub: () => {
    window.location.href = 'http://localhost:5000/api/auth/github';
  },
  
  // OAuth Google (redirige vers Google)
  loginWithGoogle: () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  }
};