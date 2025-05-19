import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { IUser } from '../../domain/entities/user.entity';

// Augment FastifyRequest interface
declare module 'fastify' {
  interface FastifyRequest {
    user?: IUser; // User can be undefined if authentication fails or hasn't run
  }
}

export const buildAuthHooks = (authService: AuthService, userRepository: IUserRepository) => {
  const authenticateHook = async (request: FastifyRequest, reply: FastifyReply) => {
    let token: string | undefined = undefined;

    // 1. Try to get token from Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. If not in header, try to get token from cookie
    if (!token && request.cookies && request.cookies.token) {
      token = request.cookies.token;
    }

    if (!token) {
      reply.code(401).send({ message: 'Authentication required: No token provided in header or cookie' });
      return; // Important to stop execution here
    }
    
    try {
      const decodedPayload = authService.verifyToken(token);

      if (!decodedPayload || !decodedPayload.id) {
        reply.code(401).send({ message: 'Authentication failed: Invalid token' });
        return;
      }

      const user = await userRepository.findById(decodedPayload.id);
      if (!user) {
        reply.code(401).send({ message: 'Authentication failed: User not found' });
        return;
      }
      request.user = user; // Attach user to the request object
    } catch (error) {
      // Clear cookie if token verification failed to prevent user from being stuck with an invalid cookie
      reply.clearCookie('token', { path: '/' });
      reply.code(401).send({ message: 'Authentication error', details: (error as Error).message });
    }
  };

  const adminOnlyHook = async (request: FastifyRequest, reply: FastifyReply) => {
    // This hook assumes authenticateHook has already run and populated request.user
    if (!request.user) {
        // This case should ideally be caught by authenticateHook first
        reply.code(401).send({ message: 'Authentication required'}); 
        return;
    }
    if (!request.user.isAdmin) {
      reply.code(403).send({ message: 'Access denied: Administrator rights required' });
      return;
    }
  };

  return { authenticateHook, adminOnlyHook };
}; 