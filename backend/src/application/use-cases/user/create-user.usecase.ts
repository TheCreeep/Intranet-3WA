import type { UserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import type { PasswordService } from '../../../domain/services/password.service.interface';
import type { CreateUserDto } from '../../dto/user/create-user.dto';
import type { User } from '../../../domain/entities/user.entity';
import { AppError } from '../../../domain/errors/AppError';
// import { UserEntity } from '../../../domain/entities/user.entity'; // Décommentez si User est une classe d'entité

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password } = createUserDto;

    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
    }

    // Idéalement, ajoutez une validation plus poussée pour l'email et le mot de passe ici (format, longueur, etc.)

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already exists', 409); // 409 Conflict
    }

    const hashedPassword = await this.passwordService.hash(password);
    
    // Si User est une classe d'entité avec un constructeur ou des méthodes statiques pour la création :
    // const newUser = UserEntity.create(name, email, hashedPassword);
    // ou new UserEntity({ name, email, password: hashedPassword });
    // Pour l'instant, nous supposons une structure d'objet simple comme définie par l'interface User.
    const userToCreate = {
      name,
      email,
      password: hashedPassword,
    };

    // La méthode save du repository est supposée prendre un objet User partiel (sans id)
    // et retourner l'entité User complète (avec id assigné par la BDD).
    try {
      const savedUser = await this.userRepository.save(userToCreate as Omit<User, 'id'>);
      return savedUser;
    } catch (error) {
      // Gérer les erreurs potentielles du repository (ex: échec de la connexion BDD, etc.)
      // Il est préférable de logguer l'erreur ici pour le débogage.
      console.error('Error in CreateUserUseCase while saving user:', error);
      throw new AppError('Could not create user', 500);
    }
  }
} 