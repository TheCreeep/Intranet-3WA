import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateUserUseCase } from './update-user.usecase'; // Ajustez le chemin
import type { UserRepository } from '../../../domain/interfaces/repositories/user.repository.interface'; // Ajustez le chemin
import type { PasswordService } from '../../../domain/services/password.service.interface'; // Ajustez le chemin
import type { UpdateUserDto } from '../../dto/user/update-user.dto'; // Ajustez le chemin
import type { User } from '../../../domain/entities/user.entity'; // Ajustez le chemin

// Mocks
const mockUserRepository: UserRepository = {
  findByEmail: vi.fn(),
  save: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findAll: vi.fn(),
};

const mockPasswordService: PasswordService = {
  hash: vi.fn(),
  compare: vi.fn(),
};

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;

  const existingUser: User = {
    id: '1',
    name: 'Original Name',
    email: 'original@example.com',
    password: 'originalHashedPassword',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    updateUserUseCase = new UpdateUserUseCase(mockUserRepository, mockPasswordService);
    // Pré-configurer findById pour la plupart des tests pour retourner un utilisateur existant
    mockUserRepository.findById.mockResolvedValue(existingUser);
  });

  it('devrait mettre à jour un utilisateur avec succès (sans changement de mot de passe)', async () => {
    const userId = '1';
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };
    // Ce que le repo.update est censé retourner (avec mdp si toujours présent)
    const userFromDbUpdate: User = { 
        ...existingUser, 
        ...updateUserDto 
    };
    const expectedUserResult: Omit<User, 'password'> = { // Ce que le use case retourne (sans mdp)
      id: existingUser.id,
      name: updateUserDto.name,
      email: updateUserDto.email,
    };

    mockUserRepository.update.mockResolvedValue(userFromDbUpdate);
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await updateUserUseCase.execute(userId, updateUserDto);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(updateUserDto.email);
    }
    expect(mockPasswordService.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.update).toHaveBeenCalledWith(userId, expect.objectContaining(updateUserDto));
    expect(result).toEqual(expectedUserResult);
  });

  it('devrait mettre à jour un utilisateur avec succès (avec changement de mot de passe)', async () => {
    const userId = '1';
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      password: 'newPassword123',
    };
    const newHashedPassword = 'newHashedPassword';
    // Ce que le repo.update est censé retourner
    const userFromDbUpdate: User = { 
        ...existingUser, 
        name: updateUserDto.name, 
        password: newHashedPassword 
    };
    const expectedUserResult: Omit<User, 'password'> = { // Ce que le use case retourne
      id: existingUser.id,
      name: updateUserDto.name,
      email: existingUser.email, // l'email n'a pas changé dans ce DTO
    };

    mockPasswordService.hash.mockResolvedValue(newHashedPassword);
    mockUserRepository.update.mockResolvedValue(userFromDbUpdate);

    const result = await updateUserUseCase.execute(userId, updateUserDto);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockPasswordService.hash).toHaveBeenCalledWith(updateUserDto.password);
    expect(mockUserRepository.update).toHaveBeenCalledWith(userId, 
      expect.objectContaining({ name: updateUserDto.name, password: newHashedPassword })
    );
    expect(result).toEqual(expectedUserResult);
  });

  it('devrait lever une erreur "UserNotFound" si l\'utilisateur à mettre à jour n\'est pas trouvé', async () => {
    const userId = 'nonExistentId';
    const updateUserDto: UpdateUserDto = { name: 'Any Name' };

    mockUserRepository.findById.mockResolvedValue(null);

    await expect(updateUserUseCase.execute(userId, updateUserDto))
      .rejects
      .toThrow('User not found');

    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it('devrait lever une erreur si le nouvel email est déjà utilisé par un autre utilisateur', async () => {
    const userId = '1';
    const updateUserDto: UpdateUserDto = {
      email: 'taken@example.com',
    };
    const anotherUserWithEmail: User = {
      id: '2', // ID différent de l'utilisateur actuel
      name: 'Another User',
      email: 'taken@example.com',
      password: 'hashed',
    };

    mockUserRepository.findByEmail.mockResolvedValue(anotherUserWithEmail);

    await expect(updateUserUseCase.execute(userId, updateUserDto))
      .rejects
      .toThrow('Email already in use by another account');

    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it('devrait permettre la mise à jour de l\'email si c\'est le même que l\'actuel (ou si non modifié)', async () => {
    const userId = '1';
    const updateUserDto: UpdateUserDto = {
      email: existingUser.email, // Email identique à l'existant
      name: "Only Name Changed"
    };
    // Ce que le repo.update est censé retourner
    const userFromDbUpdate: User = { 
        ...existingUser, 
        ...updateUserDto 
    };
    const expectedUserResult: Omit<User, 'password'> = { // Ce que le use case retourne
      id: existingUser.id,
      name: updateUserDto.name,
      email: updateUserDto.email,
    };

    mockUserRepository.update.mockResolvedValue(userFromDbUpdate);
    mockUserRepository.findByEmail.mockResolvedValue(null); 

    const result = await updateUserUseCase.execute(userId, updateUserDto);
    expect(mockUserRepository.update).toHaveBeenCalledWith(userId, expect.objectContaining(updateUserDto));
    expect(result).toEqual(expectedUserResult);
  });

  it('devrait lever une erreur si aucune donnée de mise à jour n\'est fournie', async () => {
    const userId = '1';
    const updateUserDto: UpdateUserDto = {}; // DTO vide

    // Ce test suppose une validation dans le cas d\'utilisation
    await expect(updateUserUseCase.execute(userId, updateUserDto))
      .rejects
      .toThrow('No update data provided'); // Ou ValidationError

    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });
}); 