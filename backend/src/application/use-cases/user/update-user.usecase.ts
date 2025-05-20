import type { UserRepository } from '../../../domain/interfaces/repositories/user.repository.interface';
import type { PasswordService } from '../../../domain/services/password.service.interface';
import type { UpdateUserDto } from '../../dto/user/update-user.dto';
import type { User } from '../../../domain/entities/user.entity';
import { AppError } from '../../../domain/errors/AppError';

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService
  ) {}

  async execute(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (Object.keys(updateUserDto).length === 0) {
      throw new AppError('No update data provided', 400);
    }

    try {
      let userToUpdate = await this.userRepository.findById(userId);
      if (!userToUpdate) {
        throw new AppError('User not found', 404);
      }

      // Gérer la mise à jour de l'email
      if (updateUserDto.email && updateUserDto.email !== userToUpdate.email) {
        const existingUserWithNewEmail = await this.userRepository.findByEmail(updateUserDto.email);
        if (existingUserWithNewEmail && existingUserWithNewEmail.id !== userId) {
          throw new AppError('Email already in use by another account', 409);
        }
      }

      // Copier les champs du DTO vers l'utilisateur à mettre à jour
      // Ceci est une approche simple. Pour des objets plus complexes, un mapping plus explicite serait mieux.
      const dataForUpdate: Partial<User> = {};
      if (updateUserDto.name !== undefined) dataForUpdate.name = updateUserDto.name;
      if (updateUserDto.email !== undefined) dataForUpdate.email = updateUserDto.email;
      // etc. pour les autres champs autorisés à être mis à jour et présents dans User.

      // Gérer la mise à jour du mot de passe
      if (updateUserDto.password) {
        dataForUpdate.password = await this.passwordService.hash(updateUserDto.password);
      }

      if (Object.keys(dataForUpdate).length === 0) {
        // Si après filtrage, il ne reste rien à mettre à jour (par exemple, DTO contenait seulement des champs non modifiables)
        // On peut choisir de retourner l'utilisateur existant ou de lever une erreur.
        // Ici, on retourne l'utilisateur existant car les tests attendent un utilisateur.
        // Exclure le mot de passe pour la réponse.
        const { password, ...userWithoutPassword } = userToUpdate;
        return userWithoutPassword as User;
      }

      const updatedUserEntity = await this.userRepository.update(userId, dataForUpdate);
      if (!updatedUserEntity) {
        throw new AppError('Failed to update user', 500);
      }

      const { password, ...userWithoutPassword } = updatedUserEntity;
      return userWithoutPassword as User;

    } catch (error) {
      console.error(`Error in UpdateUserUseCase while updating user ${userId}:`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Could not update user', 500);
    }
  }
} 