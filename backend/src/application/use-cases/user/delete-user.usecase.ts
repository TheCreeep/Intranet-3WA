import type { UserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import { AppError } from '../../../domain/errors/AppError';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<void> {
    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      await this.userRepository.delete(userId);
      // La suppression réussie ne retourne rien.
    } catch (error) {
      console.error(`Error in DeleteUserUseCase while deleting user ${userId}:`, error);
      if (error instanceof AppError) {
        throw error; // Propager les AppError connues (comme UserNotFound)
      }
      throw new AppError('Could not delete user', 500);
    }
  }
} 