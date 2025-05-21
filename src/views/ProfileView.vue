<template>
  <div class="profile-view">
    <h1>Mon Profil</h1>
    <form v-if="editableUser" @submit.prevent="handleSave" class="profile-form">
      <div class="user-details-grid">
        <div class="profile-picture-container">
          <img
            :src="editableUser.photo || 'https://via.placeholder.com/150'"
            alt="Profile Picture"
            class="profile-picture-large"
          />
          <label for="photoUrl" class="form-label">URL de la photo:</label>
          <input
            type="url"
            id="photoUrl"
            v-model="editableUser.photo"
            class="form-input"
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        <div class="info-fields">
          <div class="form-group">
            <label for="firstname" class="form-label">Prénom:</label>
            <input
              type="text"
              id="firstname"
              v-model="editableUser.firstname"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label for="lastname" class="form-label">Nom:</label>
            <input
              type="text"
              id="lastname"
              v-model="editableUser.lastname"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label for="email" class="form-label">Email:</label>
            <input
              type="email"
              id="email"
              v-model="editableUser.email"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label for="phone" class="form-label">Téléphone:</label>
            <input
              type="tel"
              id="phone"
              v-model="editableUser.phone"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="birthdate" class="form-label">Date de naissance:</label>
            <input
              type="date"
              id="birthdate"
              v-model="editableUser.birthdate"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="city" class="form-label">Ville:</label>
            <input
              type="text"
              id="city"
              v-model="editableUser.city"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="country" class="form-label">Pays:</label>
            <input
              type="text"
              id="country"
              v-model="editableUser.country"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="gender" class="form-label">Genre:</label>
            <select
              id="gender"
              v-model="editableUser.gender"
              class="form-input"
            >
              <option value="male">Homme</option>
              <option value="female">Femme</option>
              <option value="other">Autre</option>
              <option value="">Non spécifié</option>
            </select>
          </div>
          <div class="form-group">
            <label for="category" class="form-label">Catégorie:</label>
            <input
              type="text"
              id="category"
              v-model="editableUser.category"
              class="form-input"
            />
            <!-- Consider a select if categories are predefined -->
          </div>
          <p v-if="authStore.currentUser?.isAdmin" class="admin-status">
            Statut: Administrateur
          </p>
        </div>
      </div>
      <div class="form-actions">
        <button
          type="submit"
          class="save-button"
          :disabled="!hasChanges || isLoading"
        >
          {{ isLoading ? "Sauvegarde..." : "Sauvegarder les modifications" }}
        </button>
      </div>
    </form>
    <div v-else class="loading-message">
      <p>Chargement des informations utilisateur...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useAuthStore } from "../store/authStore";
import userService from "../services/userService"; // Import userService
// Assuming User type is in user.dto.ts now, or adjust if it was moved to a top-level types/user.ts
import type { User, UpdateSelfProfileDto } from "../types/user.dto";

const authStore = useAuthStore();
const editableUser = ref<Partial<User>>({});
const isLoading = ref(false);

// Function to set up the form data from the store
const setupForm = (sourceUser: User | null | undefined) => {
  if (sourceUser) {
    // Create a deep copy to avoid mutating the store state directly
    const freshCopy = JSON.parse(JSON.stringify(sourceUser));
    // Ensure birthdate is in YYYY-MM-DD format if it exists
    if (freshCopy.birthdate && typeof freshCopy.birthdate === 'string') {
      freshCopy.birthdate = freshCopy.birthdate.split("T")[0];
    }
    editableUser.value = freshCopy;
  } else {
    editableUser.value = {}; // Reset if no user
  }
};

// Initialize the form when the component mounts and currentUser is available
// Also, re-initialize if the currentUser in the store changes (e.g., different user logs in)
watch(() => authStore.currentUser, (newCurrentUser) => {
  setupForm(newCurrentUser);
}, { immediate: true, deep: true }); // immediate: true runs the watcher once on component setup

const hasChanges = computed(() => {
  if (
    !authStore.currentUser ||
    !editableUser.value ||
    Object.keys(editableUser.value).length === 0
  )
    return false;
  const originalUserForCompare = JSON.parse(
    JSON.stringify(authStore.currentUser)
  );
  if (originalUserForCompare.birthdate) {
    originalUserForCompare.birthdate =
      originalUserForCompare.birthdate.split("T")[0];
  }
  // Ensure all keys from editableUser are considered, especially if new fields are added
  // and that we are comparing against the same set of formatted fields.
  let copyOfEditable = JSON.parse(JSON.stringify(editableUser.value));

  // Create a version of originalUserForCompare that only contains keys present in copyOfEditable
  const relevantOriginal: Partial<User> = {};
  for (const key in copyOfEditable) {
    if (Object.prototype.hasOwnProperty.call(originalUserForCompare, key)) {
      relevantOriginal[key as keyof User] =
        originalUserForCompare[key as keyof User];
    }
  }
  return JSON.stringify(relevantOriginal) !== JSON.stringify(copyOfEditable);
});

const handleSave = async () => {
  if (!hasChanges.value || !editableUser.value) return;
  isLoading.value = true;

  // Convert empty string for birthdate to null
  const birthdateToSend = editableUser.value.birthdate === "" ? null : editableUser.value.birthdate;

  // Prepare data for UpdateSelfProfileDto (omitting fields not in the DTO, like id, isAdmin, createdAt, updatedAt)
  const profileDataToSave: UpdateSelfProfileDto = {
    firstname: editableUser.value.firstname,
    lastname: editableUser.value.lastname,
    email: editableUser.value.email,
    phone: editableUser.value.phone,
    birthdate: birthdateToSend, // Use the potentially nulled birthdate
    city: editableUser.value.city,
    country: editableUser.value.country,
    photo: editableUser.value.photo,
    gender: editableUser.value.gender as "male" | "female" | undefined, // Cast as it might be wider string from User type
    category: editableUser.value.category as
      | "Marketing"
      | "Client"
      | "Technique"
      | undefined,
    // password field is included if user wants to change it
    ...(editableUser.value.password && {
      password: editableUser.value.password,
    }),
  };

  console.log("Saving own profile data (birthdate check):", profileDataToSave);
  try {
    const updatedUser = await userService.updateOwnProfile(profileDataToSave);
    authStore.user = updatedUser; // Update the store with the response from backend

    // **Crucially, also update localStorage for 'authUser'**
    localStorage.setItem('authUser', JSON.stringify(updatedUser));

    // Reset editableUser to reflect the new store state and disable save button
    editableUser.value = JSON.parse(JSON.stringify(authStore.user));
    if (editableUser.value.birthdate) {
      editableUser.value.birthdate = editableUser.value.birthdate.split("T")[0];
    }
    alert("Profil mis à jour avec succès!");
  } catch (error: any) {
    console.error("Failed to update own profile:", error);
    alert(`Erreur lors de la mise à jour du profil: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  document.title = "Mon Profil - Intranet";
});
</script>

<style scoped>
.profile-view {
  padding: 2rem;
  max-width: 900px;
  margin: 2rem auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.profile-form {
  display: contents; /* Allows grid to work directly on user-details-grid */
}

.user-details-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.5rem 2.5rem; /* row-gap column-gap */
  align-items: flex-start;
  margin-bottom: 2rem; /* Space before save button */
}

.profile-picture-container {
  display: flex;
  flex-direction: column; /* Stack image and input */
  align-items: center;
  gap: 0.75rem;
}

.profile-picture-large {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #eee;
  transition: border-color 0.3s ease;
  margin-bottom: 0.5rem; /* Space between pic and its URL input */
}

.info-fields {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(250px, 1fr)
  ); /* Responsive columns */
  gap: 1rem 1.5rem; /* row-gap column-gap */
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.4rem;
  transition: color 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  background-color: #fff;
  color: #333;
  border-radius: 6px;
  box-sizing: border-box;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out,
    background-color 0.3s ease, color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.form-actions {
  text-align: right; /* Align button to the right */
  margin-top: 1rem;
}

.save-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #007bff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
}

.save-button:disabled {
  background-color: #a0aec0;
  opacity: 0.7;
  cursor: not-allowed;
}

.admin-status {
  color: #007bff;
  font-weight: bold;
  margin-top: 0.5rem; /* Space if it's the last item in a grid cell */
  grid-column: 1 / -1; /* Span full width if in .info-fields grid */
  text-align: left;
}

.loading-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #555;
}

/* Dark mode styles */
body.dark-theme-enabled .profile-view {
  background-color: #2d3748;
  color: #e2e8f0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

body.dark-theme-enabled .form-label {
  color: #a0aec0;
}

body.dark-theme-enabled .form-input {
  background-color: #1a202c;
  border-color: #4a5568;
  color: #e2e8f0;
}

body.dark-theme-enabled .form-input:focus {
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.4);
}

body.dark-theme-enabled .profile-picture-large {
  border-color: #4a5568;
}

body.dark-theme-enabled .save-button {
  background-color: #3182ce;
}

body.dark-theme-enabled .save-button:disabled {
  background-color: #4a5568;
  opacity: 0.6;
}

body.dark-theme-enabled .admin-status {
  color: #63b3ed;
}

body.dark-theme-enabled .loading-message {
  color: #a0aec0;
}

/* Responsive adjustments (if any more needed) */
@media (max-width: 768px) {
  .user-details-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .profile-picture-container {
    margin-bottom: 1rem;
  }
  .info-fields {
    grid-template-columns: 1fr; /* Single column for info fields on mobile */
  }
  .form-actions {
    text-align: center; /* Center button on mobile */
  }
}
</style>
