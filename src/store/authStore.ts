import { defineStore } from 'pinia';
import type { AuthResponse, LoginCredentials } from '../services/authService';
import authService from '../services/authService';

export interface AuthState {
  token: string | null;
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('authToken') || null, // Persist token
    user: JSON.parse(localStorage.getItem('authUser') || 'null'), // Persist user info
    isAuthenticated: !!localStorage.getItem('authToken'),
    status: 'idle',
    error: null,
  }),
  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role || null,
    authStatus: (state) => state.status,
    authError: (state) => state.error,
  },
  actions: {
    async login(credentials: LoginCredentials) {
      this.status = 'loading';
      this.error = null;
      try {
        const data = await authService.login(credentials);
        this.token = data.token;
        this.user = data.user;
        this.isAuthenticated = true;
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user));
        this.status = 'succeeded';
        return data; // Optionally return data for the component to use
      } catch (error: any) {
        this.status = 'failed';
        this.isAuthenticated = false;
        this.token = null;
        this.user = null;
        this.error = error.message || 'Failed to login';
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        throw error; // Re-throw for the component to handle if needed
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      this.status = 'idle';
      this.error = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      // Optionally, you might want to call a backend logout endpoint here
      // router.push({ name: 'login' }); // Handled by router guards already
    },
    // Action to initialize state from localStorage (could be called in App.vue or main.ts)
    initializeAuth() {
      const token = localStorage.getItem('authToken');
      const userString = localStorage.getItem('authUser');
      if (token && userString) {
        this.token = token;
        this.user = JSON.parse(userString);
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
      }
    }
  },
}); 