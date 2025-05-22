<template>
  <div class="collaborator-search-view">
    <h1>Collaborateurs</h1>
    
    <!-- Search filters -->
    <div class="filters">
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Rechercher..." 
          class="search-input"
          @input="filterUsers"
        />
        
        <select v-model="searchField" class="search-field-select" @change="filterUsers">
          <option value="all">Tous les champs</option>
          <option value="name">Nom</option>
          <option value="email">Email</option>
          <option value="city">Ville</option>
          <option value="country">Pays</option>
          <option value="phone">Téléphone</option>
        </select>
        
        <select v-model="categoryFilter" class="category-select" @change="filterUsers">
          <option value="all">Toutes les catégories</option>
          <option value="Marketing">Marketing</option>
          <option value="Client">Client</option>
          <option value="Technique">Technique</option>
        </select>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Chargement des collaborateurs...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="filteredUsers.length === 0" class="no-results">
      <p>Aucun collaborateur trouvé</p>
    </div>
    
    <!-- Users grid -->
    <div v-else class="users-grid">
      <div v-for="user in filteredUsers" :key="user.id" class="user-card">
        <!-- Category tag -->
        <div class="category-tag" :class="getCategoryClass(user.category)">
          {{ user.category }}
        </div>
        
        <!-- Profile pic -->
        <div class="profile-pic-container">
          <img :src="user.photo || 'https://via.placeholder.com/150'" :alt="`Photo de ${user.firstname} ${user.lastname}`" class="profile-pic">
        </div>
        
        <!-- User info -->
        <div class="user-info">
          <h2 class="user-name">{{ user.firstname }} {{ user.lastname }} <span class="user-age">({{ calculateAge(user.birthdate) }})</span></h2>
          <p class="user-location">{{ user.city }}, {{ user.country }}</p>
          
          <div class="user-contact">
            <a :href="`mailto:${user.email}`" class="contact-link">
              <span class="icon">✉️</span> {{ user.email }}
            </a>
            <a :href="`tel:${user.phone}`" class="contact-link">
              <span class="icon">📱</span> {{ user.phone }}
            </a>
            <p class="birthday">
              <span class="icon">🎂</span> Anniversaire : {{ formatBirthday(user.birthdate) }}
            </p>
          </div>
        </div>
        
        <!-- Admin actions -->
        <div v-if="isAdmin" class="admin-actions">
          <button class="edit-btn" @click="editUser(user)">Modifier</button>
          <button class="delete-btn" @click="confirmDelete(user)">Supprimer</button>
        </div>
      </div>
    </div>
    
    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <span class="close-btn" @click="showEditModal = false">&times;</span>
        <h2>Modifier Collaborateur</h2>
        
        <form @submit.prevent="updateUser" class="edit-form">
          <div class="form-group">
            <label for="firstname">Prénom</label>
            <input type="text" id="firstname" v-model="editedUser.firstname" required>
          </div>
          
          <div class="form-group">
            <label for="lastname">Nom</label>
            <input type="text" id="lastname" v-model="editedUser.lastname" required>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="editedUser.email" required>
          </div>
          
          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input type="tel" id="phone" v-model="editedUser.phone" required>
          </div>
          
          <div class="form-group">
            <label for="birthdate">Date de naissance</label>
            <input type="date" id="birthdate" v-model="editedUser.birthdate" required>
          </div>
          
          <div class="form-group">
            <label for="city">Ville</label>
            <input type="text" id="city" v-model="editedUser.city" required>
          </div>
          
          <div class="form-group">
            <label for="country">Pays</label>
            <input type="text" id="country" v-model="editedUser.country" required>
          </div>
          
          <div class="form-group">
            <label for="photo">Photo URL</label>
            <input type="url" id="photo" v-model="editedUser.photo" required>
          </div>
          
          <div class="form-group">
            <label for="category">Catégorie</label>
            <select id="category" v-model="editedUser.category" required>
              <option value="Marketing">Marketing</option>
              <option value="Client">Client</option>
              <option value="Technique">Technique</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="isAdmin">Admin</label>
            <input type="checkbox" id="isAdmin" v-model="editedUser.isAdmin">
          </div>
          
          <div class="form-actions">
            <button type="button" @click="showEditModal = false" class="cancel-btn">Annuler</button>
            <button type="submit" class="save-btn" :disabled="updateLoading">
              {{ updateLoading ? 'Sauvegarde...' : 'Sauvegarder' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content delete-modal">
        <h2>Confirmer la suppression</h2>
        <p>Êtes-vous sûr de vouloir supprimer {{ userToDelete?.firstname }} {{ userToDelete?.lastname }} ?</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">Annuler</button>
          <button @click="deleteUser" class="delete-btn" :disabled="deleteLoading">
            {{ deleteLoading ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import userService from '../services/userService';
import { useAuthStore } from '../store/authStore';
import type { User, UpdateUserDto } from '../types/user.dto';

// State variables
const users = ref<User[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Filter state
const searchQuery = ref('');
const searchField = ref('all');
const categoryFilter = ref('all');

// Admin functionality
const authStore = useAuthStore();
const isAdmin = computed(() => !!authStore.currentUser?.isAdmin);

// Modal state for editing
const showEditModal = ref(false);
const editedUser = ref<UpdateUserDto>({});
const selectedUserId = ref<string | null>(null);
const updateLoading = ref(false);

// Modal state for deleting
const showDeleteModal = ref(false);
const userToDelete = ref<User | null>(null);
const deleteLoading = ref(false);

// Fetch all users
const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    users.value = await userService.getAllUsers();
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des collaborateurs';
    console.error('Error fetching users:', err);
  } finally {
    loading.value = false;
  }
};

// Filter users based on search query and filters
const filteredUsers = computed(() => {
  if (!users.value.length) return [];
  
  return users.value.filter(user => {
    // Apply category filter
    if (categoryFilter.value !== 'all' && user.category !== categoryFilter.value) {
      return false;
    }
    
    // If no search query, return all users that match category
    if (!searchQuery.value) return true;
    
    const query = searchQuery.value.toLowerCase();
    
    // Search in the selected field
    if (searchField.value === 'all') {
      return (
        user.firstname.toLowerCase().includes(query) ||
        user.lastname.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.city.toLowerCase().includes(query) ||
        user.country.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query)
      );
    } else if (searchField.value === 'name') {
      return (
        user.firstname.toLowerCase().includes(query) ||
        user.lastname.toLowerCase().includes(query) ||
        `${user.firstname} ${user.lastname}`.toLowerCase().includes(query)
      );
    } else {
      // Search in specific field
      return user[searchField.value as keyof User]?.toString().toLowerCase().includes(query) || false;
    }
  });
});

// Utility to filter users
const filterUsers = () => {
  // The computed property will handle the filtering
  // This function is just a placeholder for the input/select change events
};

// Format functions
const calculateAge = (birthdate: string) => {
  const birthDate = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

const formatBirthday = (birthdate: string) => {
  const date = new Date(birthdate);
  const day = date.getDate();
  const month = date.toLocaleDateString('fr-FR', { month: 'long' });
  return `${day} ${month}`;
};

// Get CSS class for category tag
const getCategoryClass = (category: string) => {
  switch (category) {
    case 'Marketing':
      return 'category-marketing';
    case 'Client':
      return 'category-client';
    case 'Technique':
      return 'category-technique';
    default:
      return '';
  }
};

// Admin functions
const editUser = (user: User) => {
  editedUser.value = { ...user };
  selectedUserId.value = user.id;
  showEditModal.value = true;
};

const updateUser = async () => {
  if (!selectedUserId.value) return;
  
  updateLoading.value = true;
  
  try {
    await userService.updateUser(selectedUserId.value, editedUser.value);
    // Refresh the users list
    await fetchUsers();
    // Close the modal
    showEditModal.value = false;
  } catch (err: any) {
    console.error('Error updating user:', err);
    alert(`Erreur lors de la mise à jour : ${err.message}`);
  } finally {
    updateLoading.value = false;
  }
};

const confirmDelete = (user: User) => {
  userToDelete.value = user;
  showDeleteModal.value = true;
};

const deleteUser = async () => {
  if (!userToDelete.value) return;
  
  deleteLoading.value = true;
  
  try {
    await userService.deleteUser(userToDelete.value.id);
    // Refresh the users list
    await fetchUsers();
    // Close the modal
    showDeleteModal.value = false;
  } catch (err: any) {
    console.error('Error deleting user:', err);
    alert(`Erreur lors de la suppression : ${err.message}`);
  } finally {
    deleteLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  document.title = 'Collaborateurs - Intranet';
  fetchUsers();
});
</script>

<style scoped>
.collaborator-search-view {
  padding: 2rem;
  background-color: #1a202c; /* Dark background by default */
  color: #e2e8f0;
  min-height: calc(100vh - 60px); /* Account for navbar height */
}

h1 {
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
}

/* Filters */
.filters {
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.search-input {
  padding: 0.65rem 1rem;
  font-size: 1rem;
  border: 1px solid #4a5568;
  background-color: #2d3748;
  color: #e2e8f0;
  border-radius: 6px;
  min-width: 250px;
  flex-grow: 1;
  max-width: 400px;
}

.search-input::placeholder {
  color: #a0aec0;
}

.search-field-select,
.category-select {
  padding: 0.65rem 1rem;
  font-size: 1rem;
  border: 1px solid #4a5568;
  background-color: #2d3748;
  color: #e2e8f0;
  border-radius: 6px;
  min-width: 150px;
}

/* Users Grid */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.user-card {
  position: relative;
  background-color: #2d3748;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  padding: 1.5rem;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

/* Category tag */
.category-tag {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.category-marketing {
  background-color: #4299e1; /* Blue */
}

.category-client {
  background-color: #48bb78; /* Green */
}

.category-technique {
  background-color: #ed8936; /* Orange */
}

/* Profile pic */
.profile-pic-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.profile-pic {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #4a5568;
}

/* User info */
.user-info {
  text-align: center;
}

.user-name {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.user-age {
  font-size: 1rem;
  font-weight: 400;
  color: #a0aec0;
}

.user-location {
  font-size: 1rem;
  color: #a0aec0;
  margin-bottom: 1.5rem;
}

.user-contact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.contact-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #63b3ed;
  text-decoration: none;
  transition: color 0.2s ease;
}

.contact-link:hover {
  color: #4299e1;
  text-decoration: underline;
}

.birthday {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #e2e8f0;
}

.icon {
  font-size: 1.2rem;
}

/* Admin actions */
.admin-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.edit-btn,
.delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.edit-btn {
  background-color: #4299e1;
  color: white;
}

.edit-btn:hover {
  background-color: #3182ce;
}

.delete-btn {
  background-color: #f56565;
  color: white;
}

.delete-btn:hover {
  background-color: #e53e3e;
}

/* Loading, error, and empty states */
.loading,
.error,
.no-results {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
}

.error {
  color: #fc8181;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: #2d3748;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.delete-modal {
  max-width: 400px;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  cursor: pointer;
  color: #a0aec0;
}

.close-btn:hover {
  color: #e2e8f0;
}

/* Form */
.edit-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  color: #a0aec0;
}

.form-group input,
.form-group select {
  padding: 0.65rem 0.9rem;
  font-size: 1rem;
  border: 1px solid #4a5568;
  background-color: #1a202c;
  color: #e2e8f0;
  border-radius: 6px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.3);
}

.form-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  align-self: flex-start;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-btn,
.save-btn {
  padding: 0.65rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cancel-btn {
  background-color: #4a5568;
  color: white;
}

.cancel-btn:hover {
  background-color: #2d3748;
}

.save-btn {
  background-color: #4299e1;
  color: white;
}

.save-btn:hover {
  background-color: #3182ce;
}

.save-btn:disabled,
.delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: center;
  }
  
  .search-input,
  .search-field-select,
  .category-select {
    width: 100%;
    max-width: 100%;
  }
  
  .edit-form {
    grid-template-columns: 1fr;
  }
}
</style> 