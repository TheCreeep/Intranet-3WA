import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import userService from '../userService'
import { useAuthStore } from '../../store/authStore'
import type { CreateUserDto, UpdateUserDto, User, UpdateSelfProfileDto } from '../../types/user.dto'

// Mock axios
vi.mock('axios')

// Mock auth store
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn()
}))

describe('User Service', () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL || '/api'
  const mockToken = 'mock-token'
  const mockAuthHeaders = { headers: { Authorization: `Bearer ${mockToken}` } }
  
  const mockUser: User = {
    id: '1',
    gender: 'male',
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    phone: '123456789',
    birthdate: '1990-01-01',
    city: 'Paris',
    country: 'France',
    photo: 'https://example.com/photo.jpg',
    category: 'Technique',
    isAdmin: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock auth store to return a token
    vi.mocked(useAuthStore).mockReturnValue({
      token: mockToken,
      // Add other properties as needed
    } as any)
  })

  describe('createUser', () => {
    it('successfully creates a user', async () => {
      // Mock data
      const mockCreateUserDto: CreateUserDto = {
        gender: 'male',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '123456789',
        birthdate: '1990-01-01',
        city: 'Paris',
        country: 'France',
        photo: 'https://example.com/photo.jpg',
        category: 'Technique',
        isAdmin: false
      }

      // Mock response
      const mockResponse = { data: mockUser }
      vi.mocked(axios.post).mockResolvedValue(mockResponse)

      // Call service
      const result = await userService.createUser(mockCreateUserDto)

      // Verify axios was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/users`,
        mockCreateUserDto,
        mockAuthHeaders
      )

      // Verify the result
      expect(result).toEqual(mockUser)
    })

    it('throws error when creation fails', async () => {
      // Mock data
      const mockCreateUserDto: CreateUserDto = {
        gender: 'male',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '123456789',
        birthdate: '1990-01-01',
        city: 'Paris',
        country: 'France',
        photo: 'https://example.com/photo.jpg',
        category: 'Technique',
        isAdmin: false
      }

      // Mock error response
      const errorMessage = 'Email already exists'
      const mockError = {
        response: {
          data: { message: errorMessage }
        }
      }
      vi.mocked(axios.post).mockRejectedValue(mockError)
      vi.mocked(axios.isAxiosError).mockReturnValue(true)

      // Call service and expect error
      await expect(userService.createUser(mockCreateUserDto)).rejects.toThrow(errorMessage)

      // Verify axios was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/users`,
        mockCreateUserDto,
        mockAuthHeaders
      )
    })
  })

  describe('getAllUsers', () => {
    it('successfully fetches all users', async () => {
      // Mock response
      const mockUsers = [mockUser, { ...mockUser, id: '2', email: 'jane.doe@example.com' }]
      const mockResponse = { data: mockUsers }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      // Call service
      const result = await userService.getAllUsers()

      // Verify axios was called correctly
      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/users`,
        mockAuthHeaders
      )

      // Verify the result
      expect(result).toEqual(mockUsers)
      expect(result.length).toBe(2)
    })

    it('throws error when fetch fails', async () => {
      // Mock error response
      const errorMessage = 'Failed to fetch users'
      const mockError = {
        response: {
          data: { message: errorMessage }
        }
      }
      vi.mocked(axios.get).mockRejectedValue(mockError)
      vi.mocked(axios.isAxiosError).mockReturnValue(true)

      // Call service and expect error
      await expect(userService.getAllUsers()).rejects.toThrow(errorMessage)

      // Verify axios was called correctly
      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/users`,
        mockAuthHeaders
      )
    })
  })

  describe('getUserById', () => {
    it('successfully fetches a user by ID', async () => {
      // Mock response
      const mockResponse = { data: mockUser }
      vi.mocked(axios.get).mockResolvedValue(mockResponse)

      // Call service
      const result = await userService.getUserById('1')

      // Verify axios was called correctly
      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/users/1`,
        mockAuthHeaders
      )

      // Verify the result
      expect(result).toEqual(mockUser)
    })

    it('throws error when user not found', async () => {
      // Mock error response
      const errorMessage = 'User not found'
      const mockError = {
        response: {
          data: { message: errorMessage }
        }
      }
      vi.mocked(axios.get).mockRejectedValue(mockError)
      vi.mocked(axios.isAxiosError).mockReturnValue(true)

      // Call service and expect error
      await expect(userService.getUserById('999')).rejects.toThrow(errorMessage)

      // Verify axios was called correctly
      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/users/999`,
        mockAuthHeaders
      )
    })
  })

  describe('updateUser', () => {
    it('successfully updates a user', async () => {
      // Mock data
      const mockUpdateUserDto: UpdateUserDto = {
        firstname: 'John Updated',
        lastname: 'Doe Updated'
      }

      const updatedUser = { ...mockUser, ...mockUpdateUserDto }
      const mockResponse = { data: updatedUser }
      vi.mocked(axios.put).mockResolvedValue(mockResponse)

      // Call service
      const result = await userService.updateUser('1', mockUpdateUserDto)

      // Verify axios was called correctly
      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/users/1`,
        mockUpdateUserDto,
        mockAuthHeaders
      )

      // Verify the result
      expect(result).toEqual(updatedUser)
      expect(result.firstname).toBe('John Updated')
      expect(result.lastname).toBe('Doe Updated')
    })

    it('throws error when update fails', async () => {
      // Mock data
      const mockUpdateUserDto: UpdateUserDto = {
        email: 'invalid-email'
      }

      // Mock error response
      const errorMessage = 'Invalid email format'
      const mockError = {
        response: {
          data: { message: errorMessage }
        }
      }
      vi.mocked(axios.put).mockRejectedValue(mockError)
      vi.mocked(axios.isAxiosError).mockReturnValue(true)

      // Call service and expect error
      await expect(userService.updateUser('1', mockUpdateUserDto)).rejects.toThrow(errorMessage)

      // Verify axios was called correctly
      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/users/1`,
        mockUpdateUserDto,
        mockAuthHeaders
      )
    })
  })

  describe('deleteUser', () => {
    it('successfully deletes a user', async () => {
      // Mock response
      vi.mocked(axios.delete).mockResolvedValue({})

      // Call service
      await userService.deleteUser('1')

      // Verify axios was called correctly
      expect(axios.delete).toHaveBeenCalledWith(
        `${API_URL}/users/1`,
        mockAuthHeaders
      )
    })

    it('throws error when deletion fails', async () => {
      // Mock error response
      const errorMessage = 'User not found'
      const mockError = {
        response: {
          data: { message: errorMessage }
        }
      }
      vi.mocked(axios.delete).mockRejectedValue(mockError)
      vi.mocked(axios.isAxiosError).mockReturnValue(true)

      // Call service and expect error
      await expect(userService.deleteUser('999')).rejects.toThrow(errorMessage)

      // Verify axios was called correctly
      expect(axios.delete).toHaveBeenCalledWith(
        `${API_URL}/users/999`,
        mockAuthHeaders
      )
    })
  })

  describe('updateOwnProfile', () => {
    it('successfully updates own profile', async () => {
      // Mock data
      const mockUpdateProfileDto: UpdateSelfProfileDto = {
        firstname: 'John Updated',
        lastname: 'Doe Updated',
        phone: '987654321'
      }

      const updatedUser = { ...mockUser, ...mockUpdateProfileDto }
      const mockResponse = { data: updatedUser }
      vi.mocked(axios.put).mockResolvedValue(mockResponse)

      // Call service
      const result = await userService.updateOwnProfile(mockUpdateProfileDto)

      // Verify axios was called correctly
      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/profile`,
        mockUpdateProfileDto,
        mockAuthHeaders
      )

      // Verify the result
      expect(result).toEqual(updatedUser)
      expect(result.firstname).toBe('John Updated')
      expect(result.lastname).toBe('Doe Updated')
      expect(result.phone).toBe('987654321')
    })

    it('throws error when profile update fails', async () => {
      // Mock data
      const mockUpdateProfileDto: UpdateSelfProfileDto = {
        email: 'invalid-email'
      }

      // Mock error response
      const errorMessage = 'Invalid email format'
      const mockError = {
        response: {
          data: { message: errorMessage }
        }
      }
      vi.mocked(axios.put).mockRejectedValue(mockError)
      vi.mocked(axios.isAxiosError).mockReturnValue(true)

      // Call service and expect error
      await expect(userService.updateOwnProfile(mockUpdateProfileDto)).rejects.toThrow(errorMessage)

      // Verify axios was called correctly
      expect(axios.put).toHaveBeenCalledWith(
        `${API_URL}/profile`,
        mockUpdateProfileDto,
        mockAuthHeaders
      )
    })
  })

  describe('error handling', () => {
    it('handles network error', async () => {
      // Mock network error (request made but no response)
      const mockError = {
        request: {},
        isAxiosError: true
      }
      vi.mocked(axios.get).mockRejectedValue(mockError)
      vi.mocked(axios.isAxiosError).mockReturnValue(true)

      // Call service and expect network error message
      await expect(userService.getAllUsers()).rejects.toThrow('No response from server. Please check your network connection.')
    })

    it('handles generic error', async () => {
      // Mock generic error
      const mockError = new Error('Something went wrong')
      vi.mocked(axios.get).mockRejectedValue(mockError)
      vi.mocked(axios.isAxiosError).mockReturnValue(false)

      // Call service and expect default error message
      await expect(userService.getAllUsers()).rejects.toThrow('Something went wrong')
    })
  })
}) 