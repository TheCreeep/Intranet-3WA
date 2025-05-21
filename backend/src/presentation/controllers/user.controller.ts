import { FastifyRequest, FastifyReply } from 'fastify';
import { UserUseCases } from '../../application/use-cases/user.use-cases';
import { CreateUserDto, UpdateUserDto, UpdateSelfUserDto } from '../../application/dto/user.dto';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { PasswordService } from '../../infrastructure/auth/password.service';

export class UserController {
  private userUseCases: UserUseCases;

  constructor(userRepository: IUserRepository, passwordService: PasswordService) {
    this.userUseCases = new UserUseCases(userRepository, passwordService);
  }

  async createUser(request: FastifyRequest<{ Body: CreateUserDto }>, reply: FastifyReply) {
    try {
      const user = await this.userUseCases.createUser(request.body);
      reply.code(201).send(user);
    } catch (error: any) {
      reply.code(400).send({ message: error.message });
    }
  }

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userUseCases.getAllUsers();
      reply.send(users);
    } catch (error: any) {
      reply.code(500).send({ message: 'Internal Server Error' });
    }
  }

  async getUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const user = await this.userUseCases.getUserById(request.params.id);
      if (user) {
        reply.send(user);
      } else {
        reply.code(404).send({ message: 'User not found' });
      }
    } catch (error: any) {
      reply.code(500).send({ message: 'Internal Server Error' });
    }
  }

  async updateUser(request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserDto }>, reply: FastifyReply) {
    try {
      const user = await this.userUseCases.updateUser(request.params.id, request.body);
      if (user) {
        reply.send(user);
      } else {
        reply.code(404).send({ message: 'User not found' });
      }
    } catch (error: any) {
      // Could be a validation error or other error from use case
      reply.code(error.message === 'User with this email already exists' ? 409 : 400).send({ message: error.message });
    }
  }

  async updateOwnProfile(request: FastifyRequest<{ Body: UpdateSelfUserDto }>, reply: FastifyReply) {
    try {
      if (!request.user || !request.user.id) {
        // This should ideally be caught by the authenticateHook already
        return reply.code(401).send({ message: 'Authentication required: User context not found.' });
      }
      const userId = request.user.id;
      const user = await this.userUseCases.updateUser(userId, request.body as UpdateUserDto); 
      // We cast request.body to UpdateUserDto because updateUser in use-cases expects it.
      // The key difference is that `isAdmin` won't be in request.body from UpdateSelfUserDto,
      // so it won't be passed to the use case if not present.
      if (user) {
        reply.send(user);
      } else {
        // This case might be redundant if findById is implicitly part of updateUser
        reply.code(404).send({ message: 'User not found during update.' }); 
      }
    } catch (error: any) {
      reply.code(error.message === 'User with this email already exists' ? 409 : 400).send({ message: error.message });
    }
  }

  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const success = await this.userUseCases.deleteUser(request.params.id);
      if (success) {
        reply.code(204).send();
      } else {
        reply.code(404).send({ message: 'User not found' });
      }
    } catch (error: any) {
      reply.code(500).send({ message: 'Internal Server Error' });
    }
  }
} 