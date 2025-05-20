<template>
  <div class="login-view">
    <div class="login-container">
      <h1 class="title">Connexion</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="exemple@domaine.com"
            ref="emailInput"
            required
            :disabled="auth.status === 'loading'"
          />
        </div>
        <div class="input-group">
          <label for="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Votre mot de passe"
            required
            :disabled="auth.status === 'loading'"
          />
        </div>
        <p v-if="auth.error" class="error-message">{{ auth.error }}</p>
        <button type="submit" class="login-button" :disabled="auth.status === 'loading'">
          {{ auth.status === 'loading' ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore'; // Import the auth store

const email = ref('');
const password = ref('');
const emailInput = ref<HTMLInputElement | null>(null);
const router = useRouter();
const auth = useAuthStore(); // Use the auth store

onMounted(() => {
  document.title = 'Connexion';
  // If user is already logged in (e.g. from persisted session), redirect them
  if (auth.isLoggedIn) {
    router.push({ name: 'collaboratorSearch' }); // Or their role-specific dashboard
    return;
  }
  if (emailInput.value) {
    emailInput.value.focus();
  }
});

const handleLogin = async () => {
  if (!email.value || !password.value) {
    auth.error = 'Veuillez fournir un email et un mot de passe.'; // Set error directly on store for simplicity here
    return;
  }
  try {
    await auth.login({ email: email.value, password: password.value });
    // The router guard will handle redirection if login is successful and `auth.isLoggedIn` becomes true.
    // However, we can also explicitly redirect based on role if needed immediately after login.
    if (auth.isLoggedIn) {
      if (auth.userRole === 'admin') {
        // router.push({ name: 'adminDashboard' }); // Example for admin redirect
        router.push({ name: 'collaboratorSearch' });
      } else {
        router.push({ name: 'collaboratorSearch' });
      }
    }
  } catch (error) {
    // Error is already set in the store by the login action
    // No specific action needed here unless you want to log it or do something else
    console.error('Login failed in component:', auth.error);
  }
};
</script>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f2f5; /* Light gray background */
  padding: 1rem;
  box-sizing: border-box;
}

.login-container {
  background-color: #ffffff; /* White container */
  padding: 2.5rem 3rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 2rem;
}

.login-form .input-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.login-form label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.5rem;
}

.login-form input[type="email"],
.login-form input[type="password"] {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #d1d5db; /* Light gray border */
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.login-form input[type="email"]:focus,
.login-form input[type="password"]:focus {
  outline: none;
  border-color: #007bff; /* Blue border on focus */
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.login-form input::placeholder {
  color: #a0aec0; /* Lighter placeholder text */
}

.login-button {
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #007bff; /* Blue button */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.login-button:hover {
  background-color: #0056b3; /* Darker blue on hover */
}

.login-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-container {
    padding: 2rem 1.5rem;
  }

  .title {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }

  .login-form input[type="email"],
  .login-form input[type="password"] {
    padding: 0.65rem 0.9rem;
    font-size: 0.95rem;
  }

  .login-button {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
  }
}
</style> 