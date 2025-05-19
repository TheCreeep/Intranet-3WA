import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UserController } from '../controllers/user.controller';
import { MongooseUserRepository } from '../../infrastructure/repositories/mongoose.user.repository';
import { PasswordService } from '../../infrastructure/auth/password.service';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { CreateUserDto, UpdateUserDto } from '../../application/dto/user.dto';
import { buildAuthHooks } from '../hooks/auth.hooks';

// Define schemas for validation and serialization
const createUserSchema = {
  body: {
    type: 'object',
    required: ['gender', 'firstname', 'lastname', 'email', 'password', 'phone', 'birthdate', 'city', 'country', 'photo', 'category'],
    properties: {
      gender: { type: 'string', enum: ['male', 'female'] },
      firstname: { type: 'string', minLength: 1 },
      lastname: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      phone: { type: 'string' },
      birthdate: { type: 'string', format: 'date' }, // YYYY-MM-DD
      city: { type: 'string' },
      country: { type: 'string' },
      photo: { type: 'string', format: 'url' },
      category: { type: 'string', enum: ['Marketing', 'Client', 'Technique'] },
      isAdmin: { type: 'boolean' }
    }
  }
  // We can also add response schema here for consistency and documentation
};

const updateUserSchema = {
  body: {
    type: 'object',
    properties: {
        gender: { type: 'string', enum: ['male', 'female'] },
        firstname: { type: 'string', minLength: 1 },
        lastname: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
        phone: { type: 'string' },
        birthdate: { type: 'string', format: 'date' },
        city: { type: 'string' },
        country: { type: 'string' },
        photo: { type: 'string', format: 'url' },
        category: { type: 'string', enum: ['Marketing', 'Client', 'Technique'] },
        isAdmin: { type: 'boolean' }
    },
    additionalProperties: false // Disallow properties not defined in schema
  }
};

const idParamSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', minLength: 24, maxLength: 24 } // Basic check for ObjectId like string
        }
    }
}

export default function userRoutes(fastify: FastifyInstance, options: FastifyPluginOptions, done: () => void) {
  const userRepository = new MongooseUserRepository();
  const passwordService = new PasswordService();
  const userController = new UserController(userRepository, passwordService);
  const authService = new AuthService(userRepository, passwordService);
  const { authenticateHook, adminOnlyHook } = buildAuthHooks(authService, userRepository);

  fastify.post<{ Body: CreateUserDto }>(
    '/users', 
    { schema: createUserSchema, preHandler: [authenticateHook, adminOnlyHook] }, 
    userController.createUser.bind(userController)
  );
  fastify.get(
    '/users', 
    { preHandler: [authenticateHook] }, 
    userController.getAllUsers.bind(userController)
  );
  fastify.get<{ Params: { id: string } }>(
    '/users/:id', 
    {schema: idParamSchema, preHandler: [authenticateHook]}, 
    userController.getUserById.bind(userController)
  );
  fastify.put<{ Body: UpdateUserDto; Params: { id: string } }>(
    '/users/:id',
    { schema: { ...idParamSchema, ...updateUserSchema }, preHandler: [authenticateHook, adminOnlyHook] }, 
    userController.updateUser.bind(userController)
  );
  fastify.delete<{ Params: { id: string } }>(
    '/users/:id', 
    {schema: idParamSchema, preHandler: [authenticateHook, adminOnlyHook]}, 
    userController.deleteUser.bind(userController)
  );

  done();
} 