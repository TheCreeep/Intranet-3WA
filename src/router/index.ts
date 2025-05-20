import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import CollaboratorSearchView from '../views/CollaboratorSearchView.vue'
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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false } // Public route
    },
    {
      path: '/collaborator-search',
      name: 'collaboratorSearch',
      component: CollaboratorSearchView,
      meta: { requiresAuth: true } // Protected route
    },
    // Example Admin Route (ensure AdminDashboardView.vue exists if uncommented)
    // {
    //   path: '/admin',
    //   name: 'adminDashboard',
    //   component: () => import('../views/AdminDashboardView.vue'), 
    //   meta: { requiresAuth: true, roles: ['admin'] }
    // },
    {
      path: '/', // Root path
      redirect: () => {
        if (isAuthenticated()) {
          const role = getUserRole();
          if (role === 'admin') {
            // return { name: 'adminDashboard' }; // Redirect admin to their dashboard
            return { name: 'collaboratorSearch' }; // Or common authenticated page
          }
          return { name: 'collaboratorSearch' }; // Default for other authenticated users
        }
        return { name: 'login' }; // Redirect unauthenticated to login
      }
    },
    {
      // Catch-all for unmatched routes, redirect based on auth status
      path: '/:pathMatch(.*)*', 
      redirect: () => {
        if (isAuthenticated()) {
          return { name: 'collaboratorSearch' }; // Or a 404 page for authenticated users
        }
        return { name: 'login' };
      }
    }
  ]
})

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: Function) => {
  const store = useAuthStore(); // Get store instance inside guard
  const authenticated = store.isLoggedIn;
  const userRole = store.userRole;
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRoles = to.meta.roles as string[] | undefined;

  if (requiresAuth && !authenticated) {
    // If route requires auth and user is not logged in, redirect to login
    // Pass the original intended route as a query param for redirect after login
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.name === 'login' && authenticated) {
    // If user is logged in and tries to access login page, redirect to a default authenticated page
    if (userRole === 'admin') {
      // next({ name: 'adminDashboard' });
      next({ name: 'collaboratorSearch' });
    } else {
      next({ name: 'collaboratorSearch' });
    }
  } else if (requiresAuth && authenticated && requiredRoles) {
    // If route requires specific roles
    if (!userRole || !requiredRoles.includes(userRole)) {
      // User does not have the required role, redirect to an unauthorized page or a fallback
      // For now, redirecting to collaboratorSearch or a generic 'unauthorized' view if you create one.
      // Or simply don't let them navigate by calling next(false) or next({ name: 'fallbackRoute' })
      next({ name: 'collaboratorSearch' }); // Fallback, consider an 'UnauthorizedView' page
    } else {
      next(); // User has the role, proceed
    }
  } else {
    next(); // Proceed with navigation for public routes or if auth conditions met
  }
});

export default router
