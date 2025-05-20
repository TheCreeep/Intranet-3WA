import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteUserUseCase } from './delete-user.usecase'; // Ajustez le chemin
import type { UserRepository } from '../../../domain/interfaces/repositories/user.repository.interface'; // Ajustez le chemin
import type { User } from '../../../domain/entities/user.entity'; // Ajustez le chemin

// Mock UserRepository
const mockUserRepository: UserRepository = {
  findByEmail: vi.fn(),
  save: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findAll: vi.fn(),
};

describe('DeleteUserUseCase', () => {
  let deleteUserUseCase: DeleteUserUseCase;

  const existingUser: User = {
    id: '1',
    name: 'User to Delete',
    email: 'delete@example.com',
    password: 'hashedPassword',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    deleteUserUseCase = new DeleteUserUseCase(mockUserRepository);
  });

  it('devrait supprimer un utilisateur avec succès', async () => {
    const userId = '1';
    mockUserRepository.findById.mockResolvedValue(existingUser);
    mockUserRepository.delete.mockResolvedValue(undefined); // La méthode delete ne retourne souvent rien

    await deleteUserUseCase.execute(userId);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
  });

  it('devrait lever une erreur "UserNotFound" si l\'utilisateur à supprimer n\'est pas trouvé', async () => {
    const userId = 'nonExistentId';
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(deleteUserUseCase.execute(userId))
      .rejects
      .toThrow('User not found');

    expect(mockUserRepository.delete).not.toHaveBeenCalled();
  });

  it('devrait lever une erreur si l\'ID n\'est pas fourni', async () => {
    await expect(deleteUserUseCase.execute(undefined as any))
      .rejects
      .toThrow('User ID is required');

    expect(mockUserRepository.findById).not.toHaveBeenCalled();
    expect(mockUserRepository.delete).not.toHaveBeenCalled();
  });

  // Testez la gestion d'erreur si la suppression échoue dans le repository (rare pour des mocks simples)
  it('devrait lever une erreur si la suppression dans le repository échoue', async () => {
    const userId = '1';
    mockUserRepository.findById.mockResolvedValue(existingUser);
    mockUserRepository.delete.mockRejectedValue(new Error('Database delete failed'));

    await expect(deleteUserUseCase.execute(userId))
      .rejects
      .toThrow('Could not delete user'); // Attendre l'erreur gérée par le use case
  });
}); 