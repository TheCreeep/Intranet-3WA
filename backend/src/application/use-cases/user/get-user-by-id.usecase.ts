import type { UserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import type { User } from '../../../domain/entities/user.entity';
import { AppError } from '../../../domain/errors/AppError';

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<User> {
    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Exclure le mot de passe de la réponse, même s'il est hashé
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User; // Caster pour correspondre au type User si l'interface User inclut password
                                          // Idéalement, avoir un UserResponseDto sans password.
    } catch (error) {
      // Gérer les erreurs potentielles du repository
      console.error(`Error in GetUserByIdUseCase while fetching user ${userId}:`, error);
      // Si l'erreur est déjà une AppError (par exemple, levée par une couche inférieure du repository si la BDD est down),
      // on pourrait vouloir la propager directement. Sinon, on lève une erreur générique.
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Could not retrieve user', 500);
    }
  }
} 