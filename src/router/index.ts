import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import CollaboratorSearchView from '../views/CollaboratorSearchView.vue'
import AdminView from '../views/AdminView.vue'; // Import AdminView
import ProfileView from '../views/ProfileView.vue'; // Import ProfileView
import AccueilView from '../views/AccueilView.vue'; // Import AccueilView
import { useAuthStore } from '../store/authStore';

// REMOVED: Top-level store instantiation and initialization will be moved to main.ts
// const authStore = useAuthStore();
// authStore.initializeAuth();

// Use Pinia store for authentication checks
// These functions will get the store instance when they are called, by which time Pinia will be active.
const isAuthenticated = (): boolean => {
  const store = useAuthStore();
  return store.isLoggedIn;
};

const getUserRole = (): string | null => {
  const store = useAuthStore();
  return store.userRole;
}

// Exporter les routes pour les tests
export const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false } // Public route
  },
  {
    path: '/collaborateurs', // Changed from /collaborator-search to match navbar link
    name: 'collaborateurs',   // Changed from collaboratorSearch
    component: CollaboratorSearchView,
    meta: { requiresAuth: true } // Protected route
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true, roles: ['admin'] } // Protected admin route
  },
  {
    path: '/profil',
    name: 'profil',
    component: ProfileView,
    meta: { requiresAuth: true } // Protected profile route
  },
  {
    path: '/accueil',
    name: 'accueil',
    component: AccueilView,
    meta: { requiresAuth: true } // Protected route
  },
  {
    path: '/', // Root path
    redirect: () => {
      if (isAuthenticated()) {
        return { name: 'accueil' }; // Default to accueil for authenticated users
      }
      return { name: 'login' }; // Redirect unauthenticated to login
    }
  },
  {
    // Catch-all for unmatched routes, redirect based on auth status
    path: '/:pathMatch(.*)*', 
    redirect: () => {
      if (isAuthenticated()) {
        return { name: 'accueil' }; // Redirect to accueil
      }
      return { name: 'login' };
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: Function) => {
  const store = useAuthStore(); // Get store instance inside guard
  const authenticated = store.isLoggedIn;
  const userRole = store.userRole;
  const userIsAdminFlag = store.currentUser?.isAdmin; // Get the isAdmin flag
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRoles = to.meta.roles as string[] | undefined;

  if (requiresAuth && !authenticated) {
    // If route requires auth and user is not logged in, redirect to login
    // Pass the original intended route as a query param for redirect after login
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.name === 'login' && authenticated) {
    // If user is logged in and tries to access login page, redirect to a default authenticated page
    next({ name: 'accueil' });
  } else if (requiresAuth && authenticated && requiredRoles) {
    // If route requires specific roles
    const hasRequiredRole =
      (userRole && requiredRoles.map(r => r.toLowerCase()).includes(userRole.toLowerCase())) ||
      (requiredRoles.includes('admin') && userIsAdminFlag === true); // Also check isAdmin flag if 'admin' role is required

    if (!hasRequiredRole) {
      // User does not have the required role, redirect to an unauthorized page or a fallback
      next({ name: 'accueil' }); // Redirect to accueil if not authorized
    } else {
      next(); // User has the role, proceed
    }
  } else {
    next(); // Proceed with navigation for public routes or if auth conditions met
  }
});

export default router
