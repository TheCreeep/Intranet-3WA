import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import Navbar from '../Navbar.vue'
import { useAuthStore } from '../../store/authStore'

// Create a mock router
const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
  { path: '/collaborateurs', name: 'collaborateurs', component: { template: '<div>Collaborators</div>' } },
  { path: '/admin', name: 'admin', component: { template: '<div>Admin</div>' } },
  { path: '/profil', name: 'profil', component: { template: '<div>Profile</div>' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

describe('Navbar Component', () => {
  let wrapper: ReturnType<typeof mount>
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    // Create a fresh pinia and router for each test
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false // Important: don't stub actions to let computed properties work
    })

    // Mount the component with shallow=false to render the full component
    wrapper = mount(Navbar, {
      global: {
        plugins: [pinia, router]
      },
      shallow: false // Render the full component
    })

    // Get store instance
    authStore = useAuthStore()
  })

  it('does not render when user is not logged in', async () => {
    // Set initial state
    authStore.isLoggedIn = false

    // Force component to update
    await wrapper.vm.$nextTick()

    // Verify navbar is not rendered
    expect(wrapper.find('.navbar').exists()).toBe(false)
  })

  it('renders when user is logged in', async () => {
    // Set initial state
    authStore.isLoggedIn = true
    authStore.currentUser = {
      id: '1',
      email: 'test@example.com',
      isAdmin: false
    }

    // Force component to update
    await wrapper.vm.$nextTick()

    // Verify navbar is rendered
    expect(wrapper.find('.navbar').exists()).toBe(true)
    
    // Vérifier que le lien vers les collaborateurs existe
    const collaborateursLink = wrapper.find('a[href="/collaborateurs"]')
    expect(collaborateursLink.exists()).toBe(true)
    
    // Vérifier que le bouton de déconnexion existe
    expect(wrapper.find('.logout-button').exists()).toBe(true)
    expect(wrapper.find('.logout-button').text()).toBe('Déconnexion')
  })

  it('shows admin link for admin users', async () => {
    // Set initial state
    authStore.isLoggedIn = true
    authStore.currentUser = {
      id: '1',
      email: 'admin@example.com',
      isAdmin: true
    }

    // Force component to update
    await wrapper.vm.$nextTick()

    // Verify admin link is visible
    expect(wrapper.find('.navbar').exists()).toBe(true)
    const adminLink = wrapper.find('a[href="/admin"]')
    expect(adminLink.exists()).toBe(true)
  })

  it('does not show admin link for regular users', async () => {
    // Set initial state
    authStore.isLoggedIn = true
    authStore.currentUser = {
      id: '1',
      email: 'user@example.com',
      isAdmin: false
    }

    // Force component to update
    await wrapper.vm.$nextTick()

    // Verify admin link is not visible
    expect(wrapper.find('.navbar').exists()).toBe(true)
    const adminLink = wrapper.find('a[href="/admin"]')
    expect(adminLink.exists()).toBe(false)
  })

  it('displays user email in the profile section', async () => {
    // Set initial state
    const userEmail = 'user@example.com'
    authStore.isLoggedIn = true
    authStore.currentUser = {
      id: '1',
      email: userEmail,
      isAdmin: false
    }

    // Force component to update
    await wrapper.vm.$nextTick()

    // Verify user email is displayed
    const userEmailElement = wrapper.find('.user-email-inline')
    expect(userEmailElement.exists()).toBe(true)
    expect(userEmailElement.text()).toBe(userEmail)
  })

  it('logs out user when logout button is clicked', async () => {
    // Set initial state
    authStore.isLoggedIn = true
    authStore.currentUser = {
      id: '1',
      email: 'user@example.com',
      isAdmin: false
    }
    authStore.logout = vi.fn()

    // Force component to update
    await wrapper.vm.$nextTick()

    // Click logout button
    await wrapper.find('.logout-button').trigger('click')

    // Verify logout action was called
    expect(authStore.logout).toHaveBeenCalled()
  })

  it('uses placeholder image when user has no profile picture', async () => {
    // Set initial state
    authStore.isLoggedIn = true
    authStore.currentUser = {
      id: '1',
      email: 'user@example.com',
      isAdmin: false
      // No photo property
    }

    // Force component to update
    await wrapper.vm.$nextTick()

    // Verify placeholder image is used
    const profilePic = wrapper.find('.profile-pic-inline')
    expect(profilePic.exists()).toBe(true)
    expect(profilePic.attributes('src')).toBe('https://via.placeholder.com/30')
  })

  it('uses user profile picture when available', async () => {
    // Set initial state
    const userPhotoUrl = 'https://example.com/photo.jpg'
    authStore.isLoggedIn = true
    authStore.currentUser = {
      id: '1',
      email: 'user@example.com',
      isAdmin: false,
      photo: userPhotoUrl
    }

    // Force component to update
    await wrapper.vm.$nextTick()

    // Verify user photo is used
    const profilePic = wrapper.find('.profile-pic-inline')
    expect(profilePic.exists()).toBe(true)
    expect(profilePic.attributes('src')).toBe(userPhotoUrl)
  })
}) 