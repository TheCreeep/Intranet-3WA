import { UserGender, UserCategory, IUser } from '../../domain/entities/user.entity';

// Base User DTO for common fields, useful for responses
export class BaseUserDto {
  id: string;
  gender: UserGender;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  birthdate: string; // Keep as string for DTO, convert in service/repo
  city: string;
  country: string;
  photo: string;
  category: UserCategory;
  isAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;

  constructor(user: IUser) {
    this.id = user.id || user._id?.toString();
    this.gender = user.gender;
    this.firstname = user.firstname;
    this.lastname = user.lastname;
    this.email = user.email;
    this.phone = user.phone;
    this.birthdate = user.birthdate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    this.city = user.city;
    this.country = user.country;
    this.photo = user.photo;
    this.category = user.category;
    this.isAdmin = user.isAdmin;
    this.createdAt = user.createdAt?.toISOString();
    this.updatedAt = user.updatedAt?.toISOString();
  }
}


// DTO for creating a user
export class CreateUserDto {
  gender!: UserGender;
  firstname!: string;
  lastname!: string;
  email!: string;
  password!: string;
  phone!: string;
  birthdate!: string; // Expect YYYY-MM-DD from client
  city!: string;
  country!: string;
  photo!: string;
  category!: UserCategory;
  isAdmin?: boolean;
}

// DTO for updating a user (all fields optional)
export interface UpdateUserDto {
  gender?: UserGender;
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string; // Optional: for password change
  phone?: string;
  birthdate?: string; // Expect YYYY-MM-DD from client
  city?: string;
  country?: string;
  photo?: string;
  category?: UserCategory;
  isAdmin?: boolean;
}

// New DTO for self-profile updates
export interface UpdateSelfUserDto {
  gender?: UserGender;
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string; // For password changes by the user themselves
  phone?: string;
  birthdate?: string;
  city?: string;
  country?: string;
  photo?: string;
  category?: UserCategory;
} 