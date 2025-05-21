export interface CreateUserDto {
  gender: 'male' | 'female';
  firstname: string;
  lastname: string;
  email: string;
  password?: string; // Password is required by backend schema but might be handled separately or optional in some frontend contexts before sending
  phone: string;
  birthdate: string; // YYYY-MM-DD
  city: string;
  country: string;
  photo: string; // URL
  category: 'Marketing' | 'Client' | 'Technique';
  isAdmin?: boolean;
}

export interface UpdateUserDto {
  gender?: 'male' | 'female';
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string; // For password changes
  phone?: string;
  birthdate?: string; // YYYY-MM-DD
  city?: string;
  country?: string;
  photo?: string; // URL
  category?: 'Marketing' | 'Client' | 'Technique';
  isAdmin?: boolean;
}

// You might also want a User interface that represents the full user object returned by the backend
// This often includes id, createdAt, updatedAt, etc., and omits password.
export interface User {
  id: string;
  gender: 'male' | 'female' | string; // string for flexibility if backend allows other values not in DTO enum
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  birthdate: string; 
  city: string;
  country: string;
  photo: string; 
  category: 'Marketing' | 'Client' | 'Technique' | string;
  isAdmin: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // role?: string; // If you have a separate role field not covered by isAdmin
}

// Corresponds to backend's UpdateSelfUserDto
export interface UpdateSelfProfileDto {
  gender?: 'male' | 'female';
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string; // For password changes
  phone?: string;
  birthdate?: string; // YYYY-MM-DD
  city?: string;
  country?: string;
  photo?: string; // URL
  category?: 'Marketing' | 'Client' | 'Technique';
  // No isAdmin field
} 