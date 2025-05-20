import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './store/authStore';

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore();
try {
  authStore.initializeAuth();
} catch (e) {
  console.error("Could not initialize auth store. This can happen if Pinia is not yet active.", e);
}

app.use(router)

app.mount('#app')
