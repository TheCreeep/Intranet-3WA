import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import authService, { type LoginCredentials } from '../authService'

// Mock axios
vi.mock('axios')

describe('Auth Service', () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL || ''
  const mockCredentials: LoginCredentials = {
    email: 'test@example.com',
    password: 'password123'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully logs in user', async () => {
    // Mock response data
    const mockResponse = {
      data: {
        token: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'user'
        }
      }
    }

    // Setup axios post mock
    vi.mocked(axios.post).mockResolvedValue(mockResponse)

    // Call the service
    const result = await authService.login(mockCredentials)

    // Verify axios was called with correct parameters
    expect(axios.post).toHaveBeenCalledWith(
      `${API_URL}/auth/login`,
      mockCredentials
    )

    // Verify the result
    expect(result).toEqual(mockResponse.data)
    expect(result.token).toBe('test-token')
    expect(result.user.id).toBe('1')
    expect(result.user.email).toBe('test@example.com')
    expect(result.user.role).toBe('user')
  })

  it('handles API error response', async () => {
    // Mock error response
    const errorMessage = 'Invalid credentials'
    const mockErrorResponse = {
      response: {
        status: 401,
        data: {
          message: errorMessage
        }
      }
    }

    // Setup axios post mock to throw error
    vi.mocked(axios.post).mockRejectedValue(mockErrorResponse)

    // Mock axios.isAxiosError to return true
    vi.mocked(axios.isAxiosError).mockReturnValue(true)

    // Call the service and expect it to throw
    await expect(authService.login(mockCredentials)).rejects.toThrow(errorMessage)

    // Verify axios was called with correct parameters
    expect(axios.post).toHaveBeenCalledWith(
      `${API_URL}/auth/login`,
      mockCredentials
    )
  })

  it('handles network error', async () => {
    // Mock network error
    const networkError = new Error('Network Error')

    // Setup axios post mock to throw network error
    vi.mocked(axios.post).mockRejectedValue(networkError)

    // Mock axios.isAxiosError to return false (not an axios error)
    vi.mocked(axios.isAxiosError).mockReturnValue(false)

    // Call the service and expect it to throw with generic message
    await expect(authService.login(mockCredentials)).rejects.toThrow('An unexpected error occurred during login.')

    // Verify axios was called with correct parameters
    expect(axios.post).toHaveBeenCalledWith(
      `${API_URL}/auth/login`,
      mockCredentials
    )
  })

  it('handles API error without message', async () => {
    // Mock error response without message
    const mockErrorResponse = {
      response: {
        status: 500,
        data: {}
      }
    }

    // Setup axios post mock to throw error
    vi.mocked(axios.post).mockRejectedValue(mockErrorResponse)

    // Mock axios.isAxiosError to return true
    vi.mocked(axios.isAxiosError).mockReturnValue(true)

    // Call the service and expect it to throw with default message
    await expect(authService.login(mockCredentials)).rejects.toThrow('Login failed')

    // Verify axios was called with correct parameters
    expect(axios.post).toHaveBeenCalledWith(
      `${API_URL}/auth/login`,
      mockCredentials
    )
  })
}) 