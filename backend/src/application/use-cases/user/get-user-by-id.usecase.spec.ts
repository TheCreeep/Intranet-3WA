import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetUserByIdUseCase } from './get-user-by-id.usecase'; // Ajustez le chemin
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

describe('GetUserByIdUseCase', () => {
  let getUserByIdUseCase: GetUserByIdUseCase;

  beforeEach(() => {
    vi.resetAllMocks();
    getUserByIdUseCase = new GetUserByIdUseCase(mockUserRepository);
  });

  it('devrait retourner un utilisateur si trouvé par ID', async () => {
    const userId = '123';
    const expectedUser: Omit<User, 'password'> = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
    };
    const userFromDb: User = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
    };

    mockUserRepository.findById.mockResolvedValue(userFromDb);

    const result = await getUserByIdUseCase.execute(userId);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(result).toEqual(expectedUser);
  });

  it('devrait lever une erreur "UserNotFound" si l\'utilisateur n\'est pas trouvé', async () => {
    const userId = 'nonExistentId';
    mockUserRepository.findById.mockResolvedValue(null);

    // Adaptez le message ou le type d\'erreur selon votre implémentation
    await expect(getUserByIdUseCase.execute(userId))
      .rejects
      .toThrow('User not found'); // Ou une classe d'erreur personnalisée comme UserNotFoundError

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  });

  it('devrait lever une erreur si l\'ID n\'est pas fourni', async () => {
    // Adaptez le message ou le type d\'erreur
    // Ce test suppose que le cas d'utilisation valide l'entrée.
    await expect(getUserByIdUseCase.execute(undefined as any)) // Forcer un ID indéfini
      .rejects
      .toThrow('User ID is required'); // Ou une classe ValidationError

    expect(mockUserRepository.findById).not.toHaveBeenCalled();
  });
}); 