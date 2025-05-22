<template>
  <div class="accueil-page dark-mode">
    <h1 class="title">Bienvenue sur l'intranet</h1>
    <h2 class="subtitle">La plate-forme de l'entreprise qui vous permet de retrouver tous vos collaborateurs.</h2>
    
    <div class="random-user-section">
      <p class="greeting-text">Avez-vous dit bonjour à :</p>
      
      <div v-if="randomUser" class="user-card dark">
        <!-- Category tag -->
        <div class="category-tag" :class="getCategoryClass(randomUser.category)">
          {{ randomUser.category }}
        </div>
        
        <!-- Profile pic -->
        <div class="profile-pic-container">
          <img :src="randomUser.photo || 'https://via.placeholder.com/150'" :alt="`Photo de ${randomUser.firstname} ${randomUser.lastname}`" class="profile-pic">
        </div>
        
        <!-- User info -->
        <div class="user-info">
          <h2 class="user-name">{{ randomUser.firstname }} {{ randomUser.lastname }} <span class="user-age">({{ calculateAge(randomUser.birthdate) }})</span></h2>
          <p class="user-location">{{ randomUser.city }}, {{ randomUser.country }}</p>
          
          <div class="user-contact">
            <a :href="`mailto:${randomUser.email}`" class="contact-link">
              <span class="icon">✉️</span> {{ randomUser.email }}
            </a>
            <a :href="`tel:${randomUser.phone}`" class="contact-link">
              <span class="icon">📱</span> {{ randomUser.phone }}
            </a>
            <p class="birthday">
              <span class="icon">🎂</span> Anniversaire : {{ formatBirthday(randomUser.birthdate) }}
            </p>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="loading">
        <p>Chargement...</p>
      </div>
      
      <button @click="getRandomUser" class="random-button">
        Dire bonjour à quelqu'un d'autre
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import userService from '../services/userService';
import type { User } from '../types/user.dto';

const randomUser = ref<User | null>(null);
const loading = ref(false);
const allUsers = ref<User[]>([]);

// Function to get all users
const fetchAllUsers = async () => {
  try {
    loading.value = true;
    allUsers.value = await userService.getAllUsers();
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
};

// Function to get a random user
const getRandomUser = () => {
  if (allUsers.value.length === 0) return;
  
  const randomIndex = Math.floor(Math.random() * allUsers.value.length);
  randomUser.value = allUsers.value[randomIndex];
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

onMounted(async () => {
  await fetchAllUsers();
  getRandomUser();
});
</script>

<style scoped>
.accueil-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
}

.dark-mode {
  background-color: #121212;
  color: #fff;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: 3rem;
  text-align: center;
  max-width: 800px;
  color: #e0e0e0;
}

.random-user-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
}

.greeting-text {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
}

.user-card {
  position: relative;
  background-color: #2d3748;
  border-radius: 10px;
  margin-bottom: 2rem;
  width: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
}

.user-card.dark {
  background-color: #1e1e1e;
  color: #fff;
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

.random-button {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.random-button:hover {
  background-color: #3c3699;
}

.loading {
  margin: 1rem 0;
}
</style> 