import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { MongooseUserRepository } from '../../infrastructure/repositories/mongoose.user.repository';
import { PasswordService } from '../../infrastructure/auth/password.service';
import { LoginDto } from '../../application/dto/auth.dto';
import { buildAuthHooks } from '../hooks/auth.hooks';

// Define schema for login request validation
const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
  },
};

export default function authRoutes(fastify: FastifyInstance, options: FastifyPluginOptions, done: () => void) {
  // These instances would ideally be managed by a DI container or passed from a central setup point
  const userRepository = new MongooseUserRepository();
  const passwordService = new PasswordService();
  const authService = new AuthService(userRepository, passwordService);
  const authController = new AuthController(authService);

  const { authenticateHook } = buildAuthHooks(authService, userRepository); // Get the authenticate hook

  fastify.post<{ Body: LoginDto }>(
    '/login',
    { schema: loginSchema },
    authController.login.bind(authController)
  );

  fastify.get(
    '/profile',
    { preHandler: [authenticateHook] }, // Protect this route
    authController.getProfile.bind(authController)
  );

  // Logout route
  fastify.post(
    '/logout',
    // No specific schema needed, preHandler for authentication might be good practice even if just clearing cookie
    // but typically logout should succeed even if token is already invalid/expired locally.
    { preHandler: [authenticateHook] }, // Optional: ensure user is somewhat authenticated before logout attempt
    authController.logout.bind(authController)
  );

  done();
} 