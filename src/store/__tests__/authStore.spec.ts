import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../authStore'
import authService from '../../services/authService'

// Mock authService
vi.mock('../../services/authService', () => ({
  default: {
    login: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Auth Store', () => {
  beforeEach(() => {
    // Create a fresh pinia and set it as active
    setActivePinia(createPinia())
    
    // Clear all mocks and localStorage before each test
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('initializes with correct default state', () => {
    const store = useAuthStore()
    
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.status).toBe('idle')
    expect(store.error).toBeNull()
  })

  it('initializes with persisted state from localStorage', () => {
    // Setup localStorage with mock data
    const mockUser = { id: '1', email: 'test@example.com', role: 'user' }
    const mockToken = 'mock-token'
    
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'authToken') return mockToken
      if (key === 'authUser') return JSON.stringify(mockUser)
      return null
    })

    const store = useAuthStore()
    
    // Store should initialize with values from localStorage
    expect(store.token).toBe(mockToken)
    expect(store.user).toEqual(mockUser)
    expect(store.isAuthenticated).toBe(true)
  })

  it('successfully logs in user', async () => {
    const store = useAuthStore()
    const credentials = { email: 'test@example.com', password: 'password' }
    const mockResponse = {
      token: 'new-token',
      user: { id: '1', email: 'test@example.com', role: 'user' }
    }

    // Mock successful login
    vi.mocked(authService.login).mockResolvedValue(mockResponse)

    await store.login(credentials)

    // Verify service was called with credentials
    expect(authService.login).toHaveBeenCalledWith(credentials)
    
    // Verify store state was updated
    expect(store.token).toBe(mockResponse.token)
    expect(store.user).toEqual(mockResponse.user)
    expect(store.isAuthenticated).toBe(true)
    expect(store.status).toBe('succeeded')
    expect(store.error).toBeNull()
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', mockResponse.token)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('authUser', JSON.stringify(mockResponse.user))
  })

  it('handles login failure', async () => {
    const store = useAuthStore()
    const credentials = { email: 'test@example.com', password: 'wrong-password' }
    const errorMessage = 'Invalid credentials'

    // Mock failed login
    vi.mocked(authService.login).mockRejectedValue(new Error(errorMessage))

    try {
      await store.login(credentials)
      // If we get here, the test should fail
      expect(true).toBe(false)
    } catch (error) {
      // Verify service was called with credentials
      expect(authService.login).toHaveBeenCalledWith(credentials)
      
      // Verify store state was updated correctly for failure
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.status).toBe('failed')
      expect(store.error).toBe(errorMessage)
      
      // Verify localStorage items were removed
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authUser')
    }
  })

  it('logs out user', () => {
    const store = useAuthStore()
    
    // Setup initial authenticated state
    store.$patch({
      token: 'existing-token',
      user: { id: '1', email: 'test@example.com', role: 'user' },
      isAuthenticated: true,
      status: 'succeeded'
    })

    store.logout()

    // Verify store state was reset
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.status).toBe('idle')
    expect(store.error).toBeNull()
    
    // Verify localStorage items were removed
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authUser')
  })

  it('correctly exposes getters', () => {
    const store = useAuthStore()
    const mockUser = { id: '1', email: 'test@example.com', role: 'admin' }
    
    // Setup initial state
    store.$patch({
      token: 'test-token',
      user: mockUser,
      isAuthenticated: true,
      status: 'succeeded'
    })

    // Verify getters return expected values
    expect(store.isLoggedIn).toBe(true)
    expect(store.currentUser).toEqual(mockUser)
    expect(store.userRole).toBe('admin')
    expect(store.authStatus).toBe('succeeded')
  })

  it('initializes auth from localStorage', () => {
    const store = useAuthStore()
    const mockUser = { id: '1', email: 'test@example.com', role: 'user' }
    const mockToken = 'persisted-token'
    
    // Setup localStorage mock returns
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'authToken') return mockToken
      if (key === 'authUser') return JSON.stringify(mockUser)
      return null
    })

    store.initializeAuth()

    // Verify store state was restored from localStorage
    expect(store.token).toBe(mockToken)
    expect(store.user).toEqual(mockUser)
    expect(store.isAuthenticated).toBe(true)
  })
}) 