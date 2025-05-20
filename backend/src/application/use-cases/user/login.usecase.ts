import type { UserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import type { PasswordService } from '../../../domain/services/password.service.interface';
import type { TokenService, TokenPayload } from '../../../domain/services/token.service.interface';
import type { LoginDto } from '../../dto/user/login.dto';
import { AppError } from '../../../domain/errors/AppError';

interface LoginResponse {
  token: string;
  user: { id: string; name: string; email: string; /* roles?: string[] etc. */ };
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) {}

  async execute(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new AppError('Invalid credentials', 401); // Non autorisé
      }

      const isPasswordValid = await this.passwordService.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Préparez le payload pour le token. Adaptez selon vos besoins (ex: inclure les rôles)
      const tokenPayload: TokenPayload = { 
        userId: user.id, 
        email: user.email 
        // Exemple: roles: user.roles (si vous avez des rôles sur votre entité User)
      };
      const token = await this.tokenService.generateToken(tokenPayload);
      
      // Retourner les informations utilisateur sans le mot de passe
      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          // roles: user.roles, // Si applicable
        },
      };
    } catch (error) {
      console.error(`Error in LoginUseCase for email ${email}:`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Login failed', 500);
    }
  }
} 