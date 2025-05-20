import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from './login.usecase'; // Ajustez le chemin
import type { UserRepository } from '../../../domain/interfaces/repositories/user.repository.interface'; // Ajustez le chemin
import type { PasswordService } from '../../../domain/services/password.service.interface'; // Ajustez le chemin
import type { TokenService, TokenPayload } from '../../../domain/services/token.service.interface'; // Ajustez le chemin
import type { LoginDto } from '../../dto/user/login.dto'; // Ajustez le chemin
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

const mockTokenService: TokenService = {
  generateToken: vi.fn(),
  verifyToken: vi.fn(), // Au cas où vous en auriez besoin pour d'autres tests/services
};

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;

  const userCredentials: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const existingUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockPasswordService,
      mockTokenService
    );
  });

  it('devrait authentifier l\'utilisateur et retourner un token avec des identifiants valides', async () => {
    const expectedToken = 'mockAuthToken';
    mockUserRepository.findByEmail.mockResolvedValue(existingUser);
    mockPasswordService.compare.mockResolvedValue(true);
    mockTokenService.generateToken.mockResolvedValue(expectedToken);

    const result = await loginUseCase.execute(userCredentials);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userCredentials.email);
    expect(mockPasswordService.compare).toHaveBeenCalledWith(userCredentials.password, existingUser.password);
    expect(mockTokenService.generateToken).toHaveBeenCalledWith({ userId: existingUser.id, email: existingUser.email }); // Ou le payload que vous utilisez
    expect(result).toEqual({ token: expectedToken, user: { id: existingUser.id, name: existingUser.name, email: existingUser.email } });
  });

  it('devrait lever une erreur "InvalidCredentialsError" si l\'email n\'existe pas', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(loginUseCase.execute(userCredentials))
      .rejects
      .toThrow('Invalid credentials'); // Ou une classe d'erreur spécifique

    expect(mockPasswordService.compare).not.toHaveBeenCalled();
    expect(mockTokenService.generateToken).not.toHaveBeenCalled();
  });

  it('devrait lever une erreur "InvalidCredentialsError" si le mot de passe est incorrect', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(existingUser);
    mockPasswordService.compare.mockResolvedValue(false);

    await expect(loginUseCase.execute(userCredentials))
      .rejects
      .toThrow('Invalid credentials');

    expect(mockTokenService.generateToken).not.toHaveBeenCalled();
  });

  it('devrait lever une erreur de validation si l\'email est manquant', async () => {
    const invalidCredentials: LoginDto = { password: 'password123' } as LoginDto;
    await expect(loginUseCase.execute(invalidCredentials))
      .rejects
      .toThrow('Email and password are required'); // Ou une classe ValidationError
  });

  it('devrait lever une erreur de validation si le mot de passe est manquant', async () => {
    const invalidCredentials: LoginDto = { email: 'test@example.com' } as LoginDto;
    await expect(loginUseCase.execute(invalidCredentials))
      .rejects
      .toThrow('Email and password are required');
  });

  it('devrait retourner des informations utilisateur spécifiques avec le token', async () => {
    const expectedToken = 'mockAuthToken';
    mockUserRepository.findByEmail.mockResolvedValue(existingUser);
    mockPasswordService.compare.mockResolvedValue(true);
    mockTokenService.generateToken.mockResolvedValue(expectedToken);

    const result = await loginUseCase.execute(userCredentials);

    expect(result.user).toBeDefined();
    expect(result.user.id).toBe(existingUser.id);
    expect(result.user.name).toBe(existingUser.name);
    expect(result.user.email).toBe(existingUser.email);
    expect(result.user.password).toBeUndefined(); // S'assurer que le mot de passe n'est pas retourné
  });
}); 