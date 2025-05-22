<template>
  <nav class="navbar" v-if="authStore.isLoggedIn">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-item brand-text">Intranet</router-link>
    </div>

    <!-- All items will now be effectively in navbar-end for a full flex layout -->
    <div class="navbar-menu-right">
      <router-link to="/collaborateurs" class="navbar-item">Collaborateurs</router-link>
      <router-link v-if="isAdmin" to="/admin" class="navbar-item">Admin</router-link>
      
      <router-link v-if="authStore.currentUser" to="/profil" class="navbar-item user-profile-item">
        <img :src="userProfilePic" alt="User Profile" class="profile-pic-inline" />
        <span class="user-email-inline">{{ authStore.currentUser.email }}</span>
      </router-link>
      
      <a class="navbar-item logout-button" @click="handleLogout">Déconnexion</a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore';

const authStore = useAuthStore();
const router = useRouter();

const isAdmin = computed(() => !!authStore.currentUser?.isAdmin);

const userProfilePic = computed(() => {
  return authStore.currentUser?.photo || 'https://via.placeholder.com/30'; // Slightly smaller for inline
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  background-color: #212529; /* Dark background */
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #343a40;
  display: flex;
  justify-content: space-between; /* Key for left and right groups */
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  position: fixed; /* Fixed position to keep it at the top */
  top: 0;
  left: 0;
  z-index: 1000; /* High z-index to keep it above other content */
}

.navbar-brand .brand-text {
  font-weight: 600;
  font-size: 1.3rem; /* Slightly larger brand text */
  color: #f8f9fa;
  text-decoration: none;
}

.navbar-menu-right {
  display: flex;
  align-items: center; /* Vertically align all items on the right */
  gap: 0.75rem; /* Spacing between items on the right */
}

.navbar-item {
  color: #adb5bd;
  padding: 0.5rem 0.75rem; /* Adjusted padding */
  text-decoration: none;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  white-space: nowrap; /* Prevent text wrapping */
}

.navbar-item:hover,
.navbar-item.router-link-exact-active {
  background-color: #343a40;
  color: #e9ecef;
}

.navbar-item.router-link-exact-active {
  font-weight: 500;
}

.user-profile-item {
  padding: 0.25rem 0.5rem; /* Less padding for profile item container */
}

.profile-pic-inline {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
  border: 1px solid #495057;
}

.user-email-inline {
  font-size: 0.9rem;
  color: #f8f9fa; 
  font-weight: 400;
}

.logout-button {
  /* Specific styling for logout if needed, e.g., like a button */
  /* background-color: #dc3545; */ /* Example: red button */
  /* color: white; */
  padding: 0.5rem 1rem;
  /* border-radius: 4px; */
}

.logout-button:hover {
  /* background-color: #c82333; */ /* Darker red on hover */
  /* color: white; */
  background-color: #495057; /* Consistent with other item hover if not a distinct button */
  color: #f8f9fa;
}

/* Removed all dropdown specific styles: .has-dropdown, .navbar-link::after, .navbar-dropdown */
</style> 