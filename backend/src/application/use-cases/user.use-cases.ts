import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IUser } from '../../domain/entities/user.entity';
import { CreateUserDto, UpdateUserDto, BaseUserDto } from '../dto/user.dto';
import { PasswordService } from '../../infrastructure/auth/password.service';

export class UserUseCases {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<BaseUserDto> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new Error('User with this email already exists'); // Or a custom DuplicateEntryError
    }
    
    // The password hashing is handled by the Mongoose pre-save hook in UserModel
    // So, we pass the plain password to the repository's create method.
    const userToCreate: Omit<IUser, '_id' | 'id' | 'createdAt' | 'updatedAt'> = {
      ...createUserDto,
      birthdate: new Date(createUserDto.birthdate), // Convert string date to Date object
      isAdmin: createUserDto.isAdmin || false, // Default to false if not provided
    };

    const createdUser = await this.userRepository.create(userToCreate);
    return new BaseUserDto(createdUser);
  }

  async getAllUsers(): Promise<BaseUserDto[]> {
    const users = await this.userRepository.findAll();
    return users.map(user => new BaseUserDto(user));
  }

  async getUserById(id: string): Promise<BaseUserDto | null> {
    const user = await this.userRepository.findById(id);
    return user ? new BaseUserDto(user) : null;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    // This use case might be used internally for auth, so it returns the full IUser
    return this.userRepository.findByEmail(email);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<BaseUserDto | null> {
    // Destructure DTO to handle transformations
    const { birthdate: birthdateStringInput, password: passwordInput, ...otherUpdateFields } = updateUserDto;

    // Prepare payload for the repository, ensuring correct types
    const userToUpdateForRepo: Partial<Omit<IUser, '_id' | 'id' | 'createdAt' | 'updatedAt'>> = {
      ...otherUpdateFields, // Spread fields that are already compatible
    };

    if (birthdateStringInput) {
      userToUpdateForRepo.birthdate = new Date(birthdateStringInput); // Convert string to Date
    }

    // If password is present in DTO, it needs to be updated.
    // The Mongoose pre-save hook in UserModel will handle hashing when the document is saved by the repository.
    if (passwordInput) {
      userToUpdateForRepo.password = passwordInput; // Pass plain password for hashing by model's pre-save hook
    }

    const updatedUser = await this.userRepository.update(id, userToUpdateForRepo);
    return updatedUser ? new BaseUserDto(updatedUser) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }
} 