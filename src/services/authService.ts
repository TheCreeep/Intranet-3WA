import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL; // Base URL for the API

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string; // Assuming 'admin' or 'user'
    // Add other user properties your API returns
  };
  // Add any other properties your login endpoint returns
}

export interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/login`,
        credentials
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Backend returned an error (e.g., 401, 400)
        throw new Error(error.response.data.message || 'Login failed');
      } else {
        // Network error or other issue
        throw new Error('An unexpected error occurred during login.');
      }
    }
  }

  // You can add other auth-related methods here later, like:
  // logout(), register(), refreshToken(), etc.
}

export default new AuthService(); 