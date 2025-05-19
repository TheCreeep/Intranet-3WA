import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IUser } from '../../domain/entities/user.entity';
import { UserModel, IUserDocument } from '../database/models/user.model';
import mongoose from 'mongoose';

export class MongooseUserRepository implements IUserRepository {
  private toDomain(userDoc: IUserDocument): IUser {
    return {
      _id: userDoc._id,
      id: userDoc._id.toString(),
      gender: userDoc.gender,
      firstname: userDoc.firstname,
      lastname: userDoc.lastname,
      email: userDoc.email,
      phone: userDoc.phone,
      birthdate: userDoc.birthdate,
      city: userDoc.city,
      country: userDoc.country,
      photo: userDoc.photo,
      category: userDoc.category,
      isAdmin: userDoc.isAdmin,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
      password: '', // Domain entity requires password, but not exposed here
    };
  }

  private toDomainWithPassword(userDoc: IUserDocument): IUser {
    return {
      _id: userDoc._id,
      id: userDoc._id.toString(),
      gender: userDoc.gender,
      firstname: userDoc.firstname,
      lastname: userDoc.lastname,
      email: userDoc.email,
      phone: userDoc.phone,
      birthdate: userDoc.birthdate,
      city: userDoc.city,
      country: userDoc.country,
      photo: userDoc.photo,
      category: userDoc.category,
      isAdmin: userDoc.isAdmin,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
      password: userDoc.password || '', // Populated by .select('+password')
    };
  }

  async create(userData: Omit<IUser, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    // Explicitly cast to any before passing to UserModel to satisfy Mongoose, as IUser includes optional _id/id
    const userToSave: any = { ...userData };
    if (userToSave.birthdate && typeof userToSave.birthdate === 'string') {
        userToSave.birthdate = new Date(userToSave.birthdate);
    }
    const newUserDoc = new UserModel(userToSave);
    const savedUser = await newUserDoc.save();
    return this.toDomain(savedUser);
  }

  async findAll(): Promise<IUser[]> {
    const userDocs = await UserModel.find();
    return userDocs.map(doc => this.toDomain(doc)); // Ensure to pass doc to this.toDomain
  }

  async findById(id: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const userDoc = await UserModel.findById(id);
    return userDoc ? this.toDomain(userDoc) : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    // For auth purposes, we might need the password, so we use .select('+password')
    const userDoc = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
    return userDoc ? this.toDomainWithPassword(userDoc) : null;
  }

  async update(id: string, userData: Partial<Omit<IUser, '_id' | 'id' | 'createdAt' | 'updatedAt'>>): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const updateData: any = { ...userData };
    if (updateData.birthdate && typeof updateData.birthdate === 'string') {
        updateData.birthdate = new Date(updateData.birthdate);
    }
    // If password is being updated, it will be hashed by the pre-save hook if we fetch and save
    // For findByIdAndUpdate, the hook is not triggered by default.
    // So, if password update is needed, it should be handled in the use case or service to hash it first,
    // or fetch the document, update, and then save.
    // For simplicity here, if password is in userData, it implies it's already hashed or should be handled by service.
    // However, the user.entity.ts password is 'string', so it's assumed to be plain if coming from DTO.
    // The Mongoose pre-save hook handles hashing. So, it's better to fetch, update, and save.

    const userDoc = await UserModel.findById(id);
    if (!userDoc) return null;

    // Update fields
    Object.assign(userDoc, updateData);
    if (updateData.password) { // If password is part of the update, it needs to be set directly for pre-save hook to hash it
        userDoc.password = updateData.password;
    }

    const updatedUserDoc = await userDoc.save();
    return this.toDomain(updatedUserDoc);
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await UserModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
} 