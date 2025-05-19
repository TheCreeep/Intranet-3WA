export type UserGender = 'male' | 'female';
export type UserCategory = 'Marketing' | 'Client' | 'Technique';

export interface IUser {
  _id?: any; // string or ObjectId, Mongoose handles this
  id?: string; // Optional: if you want to expose a string id separate from _id
  gender: UserGender;
  firstname: string;
  lastname: string;
  email: string;
  password: string; // This will be the hashed password
  phone: string;
  birthdate: Date;
  city: string;
  country: string;
  photo: string;
  category: UserCategory;
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 