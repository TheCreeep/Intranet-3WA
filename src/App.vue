<script setup lang="ts">
import { RouterView } from "vue-router";
import Navbar from './components/Navbar.vue';
</script>

<template>
  <Navbar />
  <div class="content-wrapper">
    <router-view />
  </div>
</template>

<style>
/* Global styles for your app can go here */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

#app {
  /* You might want to ensure the app takes full height or has specific layout properties */
}

/* Add padding to account for the fixed navbar */
.content-wrapper {
  padding-top: 60px; /* Adjust this value based on your navbar height */
}
</style>
