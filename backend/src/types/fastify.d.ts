import { IUser } from '../domain/entities/user.entity';

declare module 'fastify' {
  interface FastifyRequest {
    user?: IUser;
  }
} 