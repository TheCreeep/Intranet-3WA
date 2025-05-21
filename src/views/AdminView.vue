<template>
  <div class="admin-view">
    <h1>Page d'Administration</h1>
    <p>Contenu réservé aux administrateurs.</p>
    <!-- Add admin-specific components and content here -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  document.title = 'Admin - Intranet';
});
</script>

<style scoped>
.admin-view {
  padding: 2rem;
  text-align: center;
}

/* Scoped styles for the admin page */
body.dark-theme-enabled .admin-view {
  background-color: #1a202c; /* Example dark background */
  color: #e2e8f0; /* Example dark text color */
}
</style> 