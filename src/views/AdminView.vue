<template>
  <div class="admin-view">
    <h1>Ajouter un collaborateur</h1>
    
    <div class="user-create-container">
      <!-- Success or error message -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
      
      <form @submit.prevent="createUser" class="create-user-form">
        <div class="form-header">
          <div class="profile-picture-preview">
            <img :src="profilePicture" alt="Profile Preview" class="profile-picture" />
          </div>
          
          <div class="form-title-container">
            <h2>Nouveau collaborateur</h2>
            <p class="form-subtitle">Remplissez les informations pour créer un nouveau compte utilisateur</p>
          </div>
        </div>
        
        <div class="form-body">
          <div class="form-section">
            <h3>Informations personnelles</h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="gender">Genre</label>
                <select id="gender" v-model="newUser.gender" required class="form-input">
                  <option value="">Sélectionner</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="firstname">Prénom</label>
                <input 
                  type="text" 
                  id="firstname" 
                  v-model="newUser.firstname" 
                  required 
                  class="form-input"
                  placeholder="Prénom"
                />
              </div>
              
              <div class="form-group">
                <label for="lastname">Nom</label>
                <input 
                  type="text" 
                  id="lastname" 
                  v-model="newUser.lastname" 
                  required 
                  class="form-input"
                  placeholder="Nom"
                />
              </div>
              
              <div class="form-group">
                <label for="birthdate">Date de naissance</label>
                <input 
                  type="date" 
                  id="birthdate" 
                  v-model="newUser.birthdate" 
                  required 
                  class="form-input"
                />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Coordonnées</h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="newUser.email" 
                  required 
                  class="form-input"
                  placeholder="email@example.com"
                />
              </div>
              
              <div class="form-group">
                <label for="phone">Téléphone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  v-model="newUser.phone" 
                  required 
                  class="form-input"
                  placeholder="0123456789"
                />
              </div>
              
              <div class="form-group">
                <label for="city">Ville</label>
                <input 
                  type="text" 
                  id="city" 
                  v-model="newUser.city" 
                  required 
                  class="form-input"
                  placeholder="Ville"
                />
              </div>
              
              <div class="form-group">
                <label for="country">Pays</label>
                <input 
                  type="text" 
                  id="country" 
                  v-model="newUser.country" 
                  required 
                  class="form-input"
                  placeholder="Pays"
                />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Informations professionnelles</h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="category">Catégorie</label>
                <select id="category" v-model="newUser.category" required class="form-input">
                  <option value="">Sélectionner</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Client">Client</option>
                  <option value="Technique">Technique</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="photo">Photo (URL)</label>
                <input 
                  type="url" 
                  id="photo" 
                  v-model="newUser.photo" 
                  required 
                  class="form-input"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              
              <div class="form-group">
                <label for="password">Mot de passe</label>
                <div class="password-input-container">
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    id="password" 
                    v-model="newUser.password" 
                    required 
                    class="form-input"
                    placeholder="Mot de passe"
                    minlength="6"
                  />
                  <button 
                    type="button" 
                    class="toggle-password-btn" 
                    @click="showPassword = !showPassword"
                  >
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>
              
              <div class="form-group checkbox-group">
                <label class="checkbox-container">
                  <input type="checkbox" v-model="newUser.isAdmin">
                  <span class="checkbox-label">Administrateur</span>
                </label>
                <span class="checkbox-hint">L'utilisateur aura accès à toutes les fonctionnalités d'administration</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="reset" class="btn btn-secondary" @click="resetForm">Réinitialiser</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Création en cours...' : 'Créer l\'utilisateur' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import userService from '../services/userService';
import type { CreateUserDto } from '../types/user.dto';
import { useRouter } from 'vue-router';

const router = useRouter();

// Form state
const newUser = ref<CreateUserDto>({
  gender: '',
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  phone: '',
  birthdate: '',
  city: '',
  country: '',
  photo: '',
  category: '',
  isAdmin: false
});

// UI state
const showPassword = ref(false);
const isSubmitting = ref(false);
const message = ref('');
const messageType = ref('');

// Get profile picture with fallback
const profilePicture = computed(() => {
  return newUser.value.photo || newUser.value.gender === 'female' 
    ? 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png' // Female avatar
    : 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png'; // Default avatar (can be customized)
});

// Create a new user
const createUser = async () => {
  isSubmitting.value = true;
  message.value = '';
  
  try {
    await userService.createUser(newUser.value);
    message.value = 'Utilisateur créé avec succès!';
    messageType.value = 'success';
    
    // Reset form after successful creation
    resetForm();
    
    // Optional: redirect to collaborators page after a delay
    setTimeout(() => {
      router.push('/collaborateurs');
    }, 2000);
  } catch (err: any) {
    console.error('Error creating user:', err);
    message.value = err.message || 'Une erreur est survenue lors de la création de l\'utilisateur.';
    messageType.value = 'error';
  } finally {
    isSubmitting.value = false;
  }
};

// Reset the form
const resetForm = () => {
  newUser.value = {
    gender: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phone: '',
    birthdate: '',
    city: '',
    country: '',
    photo: '',
    category: '',
    isAdmin: false
  };
  showPassword.value = false;
};

onMounted(() => {
  document.title = 'Admin - Ajouter un utilisateur';
});
</script>

<style scoped>
.admin-view {
  padding: 2rem;
  background-color: #1a202c;
  color: #e2e8f0;
  min-height: calc(100vh - 60px); /* Account for navbar height */
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
  color: #e2e8f0;
}

.user-create-container {
  max-width: 900px;
  margin: 0 auto;
  background-color: #2d3748;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 500;
}

.success {
  background-color: rgba(72, 187, 120, 0.2);
  color: #48bb78;
  border: 1px solid #48bb78;
}

.error {
  background-color: rgba(245, 101, 101, 0.2);
  color: #fc8181;
  border: 1px solid #fc8181;
}

.create-user-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-header {
  display: flex;
  padding: 1.5rem;
  background-color: #2c3e50;
  border-bottom: 1px solid #4a5568;
  align-items: center;
  gap: 1.5rem;
}

.profile-picture-preview {
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-picture {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #4a5568;
  transition: border-color 0.3s ease;
  background-color: #1a202c;
}

.form-title-container {
  flex: 1;
}

.form-title-container h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
}

.form-subtitle {
  color: #a0aec0;
  font-size: 0.95rem;
}

.form-body {
  padding: 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #4299e1;
  border-bottom: 1px solid #4a5568;
  padding-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #a0aec0;
}

.form-input {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #4a5568;
  background-color: #1a202c;
  color: #e2e8f0;
  border-radius: 8px;
  width: 100%;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.4);
}

.form-input::placeholder {
  color: #4a5568;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-password-btn {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #a0aec0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-container input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4299e1;
}

.checkbox-label {
  font-weight: 500;
  color: #e2e8f0;
}

.checkbox-hint {
  font-size: 0.8rem;
  color: #a0aec0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #2c3e50;
  border-top: 1px solid #4a5568;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background-color: #4299e1;
  color: white;
}

.btn-primary:hover {
  background-color: #3182ce;
}

.btn-primary:disabled {
  background-color: #4a5568;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background-color: #4a5568;
  color: white;
}

.btn-secondary:hover {
  background-color: #2d3748;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-header {
    flex-direction: column;
    text-align: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style> 