import Fastify from 'fastify';
import connectDB from './infrastructure/database/mongoose.config';
import userRoutes from './presentation/routes/user.routes';
import dotenv from 'dotenv';
import { ensureSeedData } from './infrastructure/database/seed'; // Import the seeder function

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
    // Connect to Database first
    await connectDB();
    server.log.info('Database connected successfully.');

    // Ensure seed data is present (idempotent - only seeds if users collection is empty)
    await ensureSeedData();

    // Register routes after DB connection and seeding attempt
    server.register(userRoutes, { prefix: '/api/v1' });

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