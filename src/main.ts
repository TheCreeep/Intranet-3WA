import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './store/authStore';

// --- START: Apply Dark Mode by default or from localStorage ---
const savedDarkModePreference = localStorage.getItem('darkMode');
if (savedDarkModePreference === 'disabled') {
  document.body.classList.remove('dark-theme-enabled');
} else {
  // Default to dark mode if no preference or if it's 'enabled'
  document.body.classList.add('dark-theme-enabled');
}
// --- END: Apply Dark Mode --- 

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Initialize auth store after Pinia is used and active
const authStore = useAuthStore(); 
try {
  authStore.initializeAuth();
} catch (e) {
  console.error("Error initializing auth store:", e);
}

app.use(router)

app.mount('#app')
