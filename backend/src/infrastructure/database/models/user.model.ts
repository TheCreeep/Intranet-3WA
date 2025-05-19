import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser, UserGender, UserCategory } from '../../../domain/entities/user.entity';

// Interface for Mongoose Document, extending our domain IUser
export interface IUserDocument extends Omit<IUser, '_id' | 'id' | 'password' | 'birthdate'>, Document {
  _id: Schema.Types.ObjectId; // This is Mongoose's native ID
  password?: string; // select: false in schema
  birthdate: Date; // Mongoose handles Date type directly
  comparePassword(password: string): Promise<boolean>;
  // Note: Mongoose Document already has an 'id: any' virtual getter. 
  // We rely on toJSON transform to provide our string 'id'.
}

const userSchema = new Schema<IUserDocument>(
  {
    gender: { type: String, enum: ['male', 'female'] as UserGender[], required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }, // select: false to not return by default
    phone: { type: String, required: true },
    birthdate: { type: Date, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    photo: { type: String, required: true }, // Should be a URL
    category: { type: String, enum: ['Marketing', 'Client', 'Technique'] as UserCategory[], required: true },
    isAdmin: { type: Boolean, default: false },
  },
  { 
    timestamps: true, 
    toJSON: { 
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password; // Ensure password is not sent even if explicitly selected elsewhere
        return ret;
      }
    },
    toObject: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            delete ret.password;
            return ret;
        }
    }
  }
);

// Middleware to hash password before saving
userSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = model<IUserDocument>('User', userSchema); 