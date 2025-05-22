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
    router.push({ name: 'collaborateurs' }); // Corrected route name
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
        router.push({ name: 'collaborateurs' }); // Corrected route name
      } else {
        router.push({ name: 'collaborateurs' }); // Corrected route name
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
  transition: background-color 0.3s ease;
}

.login-container {
  background-color: #ffffff; /* White container */
  padding: 2.5rem 3rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 2rem;
  transition: color 0.3s ease;
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
  transition: color 0.3s ease;
}

.login-form input[type="email"],
.login-form input[type="password"] {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #d1d5db; /* Light gray border */
  background-color: #fff; /* Explicit light background for input */
  color: #333; /* Explicit light text color for input */
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background-color 0.3s ease, color 0.3s ease;
}

.login-form input[type="email"]:focus,
.login-form input[type="password"]:focus {
  outline: none;
  border-color: #007bff; /* Blue border on focus */
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.login-form input::placeholder {
  color: #a0aec0; /* Lighter placeholder text */
  transition: color 0.3s ease;
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
  transition: background-color 0.2s ease-in-out, color 0.3s ease;
}

.login-button:hover {
  background-color: #0056b3; /* Darker blue on hover */
}

.login-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.error-message {
  color: red; /* Standard error color, adjust if needed for dark mode */
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

/* Dark Mode Styles for LoginView */
body.dark-theme-enabled .login-view {
  background-color: #1a202c; /* Dark background for the view */
}

body.dark-theme-enabled .login-container {
  background-color: #2d3748; /* Darker container background */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

body.dark-theme-enabled .title {
  color: #e2e8f0; /* Lighter title color */
}

body.dark-theme-enabled .login-form label {
  color: #a0aec0; /* Lighter label color */
}

body.dark-theme-enabled .login-form input[type="email"],
body.dark-theme-enabled .login-form input[type="password"] {
  background-color: #1a202c; /* Dark input background */
  border-color: #4a5568;    /* Darker input border */
  color: #e2e8f0;           /* Light input text color */
}

body.dark-theme-enabled .login-form input[type="email"]:focus,
body.dark-theme-enabled .login-form input[type="password"]:focus {
  border-color: #3182ce; /* Adjusted focus border color for dark theme */
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.4); /* Adjusted focus shadow for dark theme */
}

body.dark-theme-enabled .login-form input::placeholder {
  color: #718096; /* Adjusted placeholder color for dark theme */
}

body.dark-theme-enabled .login-button {
  background-color: #3182ce; /* Adjusted button color for dark theme */
  color: #ffffff;
}

body.dark-theme-enabled .login-button:hover {
  background-color: #2b6cb0;
}

body.dark-theme-enabled .login-button:disabled {
  background-color: #4a5568;
  color: #a0aec0;
}

body.dark-theme-enabled .error-message {
  color: #feb2b2; /* Lighter red for dark backgrounds */
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