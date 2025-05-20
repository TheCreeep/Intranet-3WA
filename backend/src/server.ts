import Fastify from 'fastify';
import connectDB from './infrastructure/database/mongoose.config';
import userRoutes from './presentation/routes/user.routes';
import authRoutes from './presentation/routes/auth.routes';
import dotenv from 'dotenv';
import { ensureSeedData } from './infrastructure/database/seed'; // Import the seeder function
import fastifyCookie from '@fastify/cookie'; // Import fastify-cookie
import cors from '@fastify/cors'; // Import the CORS plugin

// Load environment variables from .env file in the backend directory
dotenv.config({ path: '../.env' }); // if server.ts is in src, .env is one level up

const server = Fastify({
  logger: true, // Enables Fastify's built-in Pino logger
});

// Global error handler (optional, can be customized)
server.setErrorHandler((error, request, reply) => {
  server.log.error(error); // Log the error
  // Send a generic error message back to the client
  reply.status(error.statusCode || 500).send({ 
    message: error.message || 'Internal Server Error',
    statusCode: error.statusCode || 500,
    error: error.validation ? 'Validation Error' : (error.name || 'Error') // Add more details for validation errors
  });
});

const start = async () => {
  try {
    // Register fastify-cookie plugin
    // Note: If fastifyCookie itself doesn't return a promise or isn't async, await isn't strictly needed here.
    // However, keeping it consistent with other registrations if they were async.
    await server.register(fastifyCookie, {
      secret: process.env.COOKIE_SECRET || 'your-fallback-cookie-secret',
    });
    server.log.info('Cookie plugin registered.');

    // Register CORS plugin
    await server.register(cors, {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      optionsSuccessStatus: 204
    });
    server.log.info('CORS plugin registered.');

    // Connect to Database
    await connectDB();
    server.log.info('Database connected successfully.');

    // Ensure seed data is present (idempotent - only seeds if users collection is empty)
    await ensureSeedData();

    // Register routes after DB connection and seeding attempt
    server.register(authRoutes, { prefix: '/api/v1/auth' });
    server.register(userRoutes, { prefix: '/api/v1' });
    server.log.info('Routes registered.');

    const port = Number(process.env.PORT) || 3000;
    await server.listen({ port, host: '0.0.0.0' });
    // Log moved to after listen is successful
    // server.log.info(`Server listening on port ${port}`); // This is now handled by Fastify itself if logger is true
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 