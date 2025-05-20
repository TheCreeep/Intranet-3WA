import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateUserUseCase } from './create-user.usecase'; // Ajustez le chemin si nécessaire
import type { UserRepository } from '../../../domain/interfaces/repositories/user.repository.interface'; // Ajustez le chemin
import type { PasswordService } from '../../../domain/services/password.service.interface'; // Ajustez le chemin
import type { CreateUserDto } from '../../dto/user/create-user.dto'; // Ajustez le chemin
import type { User } from '../../../domain/entities/user.entity'; // Ajustez le chemin

// Mocks
const mockUserRepository: UserRepository = {
  findByEmail: vi.fn(),
  save: vi.fn(),
  // Ajoutez d'autres méthodes mockées du repository si nécessaire pour d'autres tests
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findAll: vi.fn(),
};

const mockPasswordService: PasswordService = {
  hash: vi.fn(),
  compare: vi.fn(),
};

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    vi.resetAllMocks();

    // Instancier le cas d'utilisation avec les dépendances mockées
    createUserUseCase = new CreateUserUseCase(
      mockUserRepository,
      mockPasswordService
    );
  });

  it('devrait créer un utilisateur avec succès avec des données valides', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };
    const hashedPassword = 'hashedPassword123';
    const expectedUser: User = {
      id: '1', // L'ID serait généré par la BDD/repository
      ...createUserDto,
      password: hashedPassword,
    };

    mockUserRepository.findByEmail.mockResolvedValue(null); // Aucun utilisateur existant
    mockPasswordService.hash.mockResolvedValue(hashedPassword);
    // Assurez-vous que le type retourné par save correspond à ce qui est attendu par User.
    // Le mock ici simule que `save` prend un objet sans id et retourne un objet avec id.
    mockUserRepository.save.mockImplementation(async (userToSave) => ({
        id: '1', // Simule la génération d'ID
        ...userToSave,
    } as User));


    const result = await createUserUseCase.execute(createUserDto);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
    expect(mockPasswordService.hash).toHaveBeenCalledWith(createUserDto.password);
    expect(mockUserRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
      })
    );
    expect(result).toEqual(expectedUser);
  });

  it('devrait lever une erreur si l\'email existe déjà', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'existing@example.com',
      password: 'password123',
    };
    const existingUser: User = {
      id: '2',
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'hashedPassword',
    };

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    // Utiliser une fonction pour capturer l'erreur attendue
    // Ceci suppose que votre CreateUserUseCase lève une erreur avec un message spécifique.
    // Adaptez le message ou le type d'erreur selon votre implémentation.
    await expect(createUserUseCase.execute(createUserDto))
      .rejects
      .toThrow('Email already exists'); // Ou une classe d'erreur personnalisée

    expect(mockPasswordService.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('devrait lever une erreur si des champs requis sont manquants dans le DTO', async () => {
    // Exemple : email manquant
    const createUserDto: Partial<CreateUserDto> = {
      name: 'Test User',
      password: 'password123',
    };

    // Ceci suppose que votre CreateUserUseCase effectue une validation et lève une erreur.
    // Adaptez le message ou le type d'erreur.
    await expect(createUserUseCase.execute(createUserDto as CreateUserDto))
      .rejects
      .toThrow('Name, email, and password are required'); // Ou une classe ValidationError personnalisée

    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockPasswordService.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  // Vous pouvez ajouter d'autres tests, par exemple :
  // - Mot de passe manquant
  // - Nom manquant
  // - Email invalide (si la validation d'email est dans le use case et non déléguée)
}); 