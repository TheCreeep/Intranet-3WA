import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '../index'
import { useAuthStore } from '../../store/authStore'

// Il faut importer directement les routes car les gardes ne sont pas correctement recréés
// Mock the store
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn()
}))

// Mock the views
vi.mock('../../views/LoginView.vue', () => ({
  default: { template: '<div>Login</div>' }
}))

vi.mock('../../views/CollaboratorSearchView.vue', () => ({
  default: { template: '<div>Collaborator Search</div>' }
}))

vi.mock('../../views/AdminView.vue', () => ({
  default: { template: '<div>Admin</div>' }
}))

vi.mock('../../views/ProfileView.vue', () => ({
  default: { template: '<div>Profile</div>' }
}))

vi.mock('../../views/AccueilView.vue', () => ({
  default: { template: '<div>Accueil</div>' }
}))

// Créer une fonction pour configurer le routeur avec des gardes personnalisés
const createTestRouter = () => {
  // Créer le routeur
  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })

  // Ajouter un garde de navigation global
  router.beforeEach((to, from, next) => {
    const store = useAuthStore()
    const authenticated = store.isLoggedIn
    const userRole = store.userRole
    const userIsAdminFlag = store.currentUser?.isAdmin
    
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiredRoles = to.meta.roles as string[] | undefined

    if (requiresAuth && !authenticated) {
      // Si la route nécessite une authentification et que l'utilisateur n'est pas connecté, rediriger vers login
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else if (to.name === 'login' && authenticated) {
      // Si l'utilisateur est connecté et essaie d'accéder à la page de connexion, rediriger vers une page authentifiée par défaut
      next({ name: 'accueil' })
    } else if (requiresAuth && authenticated && requiredRoles) {
      // Si la route nécessite des rôles spécifiques
      const hasRequiredRole =
        (userRole && requiredRoles.map(r => r.toLowerCase()).includes(userRole.toLowerCase())) ||
        (requiredRoles.includes('admin') && userIsAdminFlag === true)

      if (!hasRequiredRole) {
        // L'utilisateur n'a pas le rôle requis, rediriger vers une page non autorisée ou une solution de repli
        next({ name: 'accueil' })
      } else {
        next() // L'utilisateur a le rôle, continuer
      }
    } else {
      next() // Poursuivre la navigation pour les routes publiques ou si les conditions d'authentification sont remplies
    }
  })

  return router
}

describe('Router', () => {
  let testRouter

  beforeEach(() => {
    // Réinitialiser tous les mocks
    vi.clearAllMocks()
  })

  describe('Authentication Guards', () => {
    it('redirects to login when accessing protected route while not authenticated', async () => {
      // Créer un routeur pour ce test
      testRouter = createTestRouter()

      // Mock auth store pour retourner non connecté
      vi.mocked(useAuthStore).mockReturnValue({
        isLoggedIn: false,
        userRole: null,
        currentUser: null
      } as any)

      // Essayer de naviguer vers une route protégée
      await testRouter.push('/collaborateurs')
      
      // Devrait rediriger vers login
      expect(testRouter.currentRoute.value.name).toBe('login')
    })

    it('allows access to collaborateurs when authenticated', async () => {
      // Créer un routeur pour ce test
      testRouter = createTestRouter()

      // Mock auth store pour retourner connecté
      vi.mocked(useAuthStore).mockReturnValue({
        isLoggedIn: true,
        userRole: 'user',
        currentUser: { isAdmin: false }
      } as any)

      // Naviguer vers la route protégée
      await testRouter.push('/collaborateurs')
      
      // Devrait permettre l'accès
      expect(testRouter.currentRoute.value.name).toBe('collaborateurs')
    })

    it('redirects to accueil when authenticated user tries to access login', async () => {
      // Créer un routeur pour ce test
      testRouter = createTestRouter()

      // Mock auth store pour retourner connecté
      vi.mocked(useAuthStore).mockReturnValue({
        isLoggedIn: true,
        userRole: 'user',
        currentUser: { isAdmin: false }
      } as any)

      // Essayer de naviguer vers login
      await testRouter.push('/login')
      
      // Devrait rediriger vers accueil
      expect(testRouter.currentRoute.value.name).toBe('accueil')
    })

    it('redirects admin to accueil when trying to access login', async () => {
      // Créer un routeur pour ce test
      testRouter = createTestRouter()

      // Mock auth store pour retourner connecté en tant qu'admin
      vi.mocked(useAuthStore).mockReturnValue({
        isLoggedIn: true,
        userRole: 'admin',
        currentUser: { isAdmin: true }
      } as any)

      // Essayer de naviguer vers login
      await testRouter.push('/login')
      
      // Devrait rediriger vers accueil
      expect(testRouter.currentRoute.value.name).toBe('accueil')
    })
  })

  describe('Role-Based Access Control', () => {
    it('allows admin to access admin route', async () => {
      // Créer un routeur pour ce test
      testRouter = createTestRouter()

      // Mock auth store pour retourner connecté en tant qu'admin
      vi.mocked(useAuthStore).mockReturnValue({
        isLoggedIn: true,
        userRole: 'admin',
        currentUser: { isAdmin: true }
      } as any)

      // Naviguer vers la route admin
      await testRouter.push('/admin')
      
      // Devrait permettre l'accès
      expect(testRouter.currentRoute.value.name).toBe('admin')
    })

    it('redirects regular user when trying to access admin route', async () => {
      // Créer un routeur pour ce test
      testRouter = createTestRouter()

      // Mock auth store pour retourner connecté en tant qu'utilisateur normal
      vi.mocked(useAuthStore).mockReturnValue({
        isLoggedIn: true,
        userRole: 'user',
        currentUser: { isAdmin: false }
      } as any)

      // Essayer de naviguer vers la route admin
      await testRouter.push('/admin')
      
      // Devrait rediriger vers accueil
      expect(testRouter.currentRoute.value.name).toBe('accueil')
    })

    it('allows user with isAdmin flag to access admin route regardless of role', async () => {
      // Créer un routeur pour ce test
      testRouter = createTestRouter()

      // Mock auth store pour retourner connecté avec isAdmin true mais rôle non admin
      vi.mocked(useAuthStore).mockReturnValue({
        isLoggedIn: true,
        userRole: 'user', // Pas le rôle admin
        currentUser: { isAdmin: true } // Mais a le flag admin
      } as any)

      // Naviguer vers la route admin
      await testRouter.push('/admin')
      
      // Devrait permettre l'accès en raison du flag isAdmin
      expect(testRouter.currentRoute.value.name).toBe('admin')
    })
  })

  describe('Root and Catchall Redirects', () => {
    it('redirects unauthenticated users to login from root path', async () => {
      // Créer un routeur pour ce test
      testRouter = createTestRouter()

      // Mock auth store pour retourner non connecté
      vi.mocked(useAuthStore).mockReturnValue({
        isLoggedIn: false,
        userRole: null,
        currentUser: null
      } as any)

      // Naviguer vers la racine
      await testRouter.push('/')
      
      // Devrait rediriger vers login
      expect(testRouter.currentRoute.value.name).toBe('login')
    })

    it('redirects authenticated users to accueil from root path', async () => {
      // Créer un routeur pour ce test
      testRouter = createTestRouter()

      // Mock auth store pour retourner connecté
      vi.mocked(useAuthStore).mockReturnValue({
        isLoggedIn: true,
        userRole: 'user',
        currentUser: { isAdmin: false }
      } as any)

      // Naviguer vers la racine
      await testRouter.push('/')
      
      // Devrait rediriger vers accueil
      expect(testRouter.currentRoute.value.name).toBe('accueil')
    })

    it('redirects authenticated users to accueil from unknown path', async () => {
      // Créer un routeur pour ce test
      testRouter = createTestRouter()

      // Mock auth store pour retourner connecté
      vi.mocked(useAuthStore).mockReturnValue({
        isLoggedIn: true,
        userRole: 'user',
        currentUser: { isAdmin: false }
      } as any)

      // Naviguer vers un chemin inconnu
      await testRouter.push('/invalid-path')
      
      // Devrait rediriger vers accueil
      expect(testRouter.currentRoute.value.name).toBe('accueil')
    })

    it('redirects unauthenticated users to login from unknown path', async () => {
      // Créer un routeur pour ce test
      testRouter = createTestRouter()

      // Mock auth store pour retourner non connecté
      vi.mocked(useAuthStore).mockReturnValue({
        isLoggedIn: false,
        userRole: null,
        currentUser: null
      } as any)

      // Naviguer vers un chemin inconnu
      await testRouter.push('/invalid-path')
      
      // Devrait rediriger vers login
      expect(testRouter.currentRoute.value.name).toBe('login')
    })
  })
}) 