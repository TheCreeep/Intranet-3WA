import axios, { type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import type { CreateUserDto, UpdateUserDto, User, UpdateSelfProfileDto } from '../types/user.dto';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api'; // Fallback if not set

// Utility to get the auth token and prepare headers
const getAuthHeaders = (): AxiosRequestConfig => {
  const authStore = useAuthStore();
  const token = authStore.token;
  if (token) {
    return { headers: { Authorization: `Bearer ${token}` } };
  }
  return {};
};

class UserService {
  // POST /users (Requires Auth, Admin Only)
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const response = await axios.post<User>(
        `${API_URL}/users`,
        userData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw this.handleError(error, 'Failed to create user.');
    }
  }

  // GET /users (Requires Auth)
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get<User[]>(
        `${API_URL}/users`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw this.handleError(error, 'Failed to fetch users.');
    }
  }

  // GET /users/:id (Requires Auth)
  async getUserById(id: string): Promise<User> {
    try {
      const response = await axios.get<User>(
        `${API_URL}/users/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw this.handleError(error, `Failed to fetch user ${id}.`);
    }
  }

  // PUT /users/:id (Requires Auth, Admin Only for general update, or self-update logic)
  // Note: Backend user.routes.ts has adminOnlyHook for PUT /users/:id
  // If a user can update their own profile, you might need a separate backend route e.g., PUT /profile/me
  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    try {
      const response = await axios.put<User>(
        `${API_URL}/users/${id}`,
        userData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw this.handleError(error, `Failed to update user ${id}.`);
    }
  }

  // DELETE /users/:id (Requires Auth, Admin Only)
  async deleteUser(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/users/${id}`, getAuthHeaders());
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw this.handleError(error, `Failed to delete user ${id}.`);
    }
  }

  // New method for updating own profile
  async updateOwnProfile(userData: UpdateSelfProfileDto): Promise<User> {
    try {
      const response = await axios.put<User>(
        `${API_URL}/profile`, // Hits the new PUT /profile endpoint
        userData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating own profile:', error);
      throw this.handleError(error, 'Failed to update your profile.');
    }
  }
  
  // Centralized error handler for the service
  private handleError(error: any, defaultMessage: string): Error {
    if (axios.isAxiosError(error) && error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const apiErrorMessage = error.response.data?.message || error.response.data?.error;
      return new Error(apiErrorMessage || defaultMessage);
    } else if (axios.isAxiosError(error) && error.request) {
      // The request was made but no response was received
      return new Error('No response from server. Please check your network connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      return new Error(error.message || defaultMessage);
    }
  }
}

export default new UserService(); 