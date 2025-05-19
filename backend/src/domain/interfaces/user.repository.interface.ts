import { IUser } from '../entities/user.entity';

export interface IUserRepository {
  create(user: Omit<IUser, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser>;
  findAll(): Promise<IUser[]>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  update(id: string, user: Partial<Omit<IUser, '_id' | 'id' | 'createdAt' | 'updatedAt'>>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
} 