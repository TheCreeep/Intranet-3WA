import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { PasswordService } from './password.service';
import { BaseUserDto } from '../../application/dto/user.dto';
import { JwtPayloadDto } from '../../application/dto/auth.dto';

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'; // Fallback for safety, ensure .env is primary
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService // Assuming PasswordService has a compare method
  ) {
    if (!this.JWT_SECRET || this.JWT_SECRET === 'your-fallback-secret-key') {
        console.warn('WARNING: JWT_SECRET is not set or using fallback. Please set a strong secret in .env');
    }
  }

  generateToken(user: Pick<IUser, 'id' | 'email' | 'isAdmin'>): string {
    const payload: JwtPayloadDto = {
      id: user.id!,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    const options: SignOptions = { expiresIn: this.JWT_EXPIRES_IN as any };
    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  verifyToken(token: string): JwtPayloadDto | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JwtPayloadDto;
      return decoded;
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }

  async login(email: string, plainPassword: string): Promise<{ userDto: BaseUserDto; token: string } | null> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.password) { // user.password will be the hashed one from DB
      return null; // User not found or password not set
    }

    // The user object from findByEmail (MongooseUserRepository) should contain the hashed password.
    // We use the PasswordService to compare.
    const isPasswordValid = await this.passwordService.compare(plainPassword, user.password);

    if (!isPasswordValid) {
      return null; // Invalid credentials
    }

    // Exclude password before generating token and returning user DTO
    const userForToken: Pick<IUser, 'id' | 'email' | 'isAdmin'> = {
        id: user.id!,
        email: user.email,
        isAdmin: user.isAdmin
    };

    const token = this.generateToken(userForToken);
    
    // Ensure the user object passed to BaseUserDto has all required fields from IUser
    // The 'user' object from findByEmail should be a complete IUser entity.
    const userDto = new BaseUserDto(user);

    return { userDto, token };
  }
} 