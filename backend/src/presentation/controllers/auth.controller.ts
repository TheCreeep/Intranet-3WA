import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { LoginDto, LoginResponseDto } from '../../application/dto/auth.dto';
import { BaseUserDto } from '../../application/dto/user.dto';

export class AuthController {
  constructor(private authService: AuthService) {}

  async login(request: FastifyRequest<{ Body: LoginDto }>, reply: FastifyReply) {
    try {
      const { email, password } = request.body;
      if (!email || !password) {
        return reply.code(400).send({ message: 'Email and password are required' });
      }

      const result = await this.authService.login(email, password);

      if (!result) {
        return reply.code(401).send({ message: 'Invalid email or password' });
      }
      
      const { userDto, token } = result;

      // Set JWT as an HTTP-Only cookie
      reply.setCookie('token', token, {
        path: '/', // Cookie is accessible from all paths
        httpOnly: true, // Client-side JS cannot access the cookie
        secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
        sameSite: 'lax', // CSRF protection: Lax or Strict
        // expires: new Date(Date.now() + (parseInt(process.env.JWT_EXPIRES_IN_SECONDS || '3600') * 1000)), // Optional: cookie expiry
        // maxAge: parseInt(process.env.JWT_EXPIRES_IN_SECONDS || '3600') // Alternative to expires
      });
      
      // Send user DTO in the response body
      reply.code(200).send({ user: userDto }); // No need to send token in body now

    } catch (error: any) {
      console.error('Login error:', error);
      reply.code(500).send({ message: 'Internal Server Error during login' });
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      reply.clearCookie('token', { path: '/' });
      reply.code(200).send({ message: 'Logged out successfully' });
    } catch (error: any) {
      console.error('Logout error:', error);
      reply.code(500).send({ message: 'Internal Server Error during logout'});
    }
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    // This route is protected, so request.user should be populated by the authenticateHook
    if (!request.user) {
        // This should ideally not be reached if the hook is applied correctly
        return reply.code(401).send({ message: 'Unauthorized: User not found in request'});
    }
    try {
      // request.user is the full IUser entity. We convert it to BaseUserDto for the response.
      const userProfile = new BaseUserDto(request.user);
      reply.code(200).send(userProfile);
    } catch (error: any) {
        console.error('Get profile error:', error);
        reply.code(500).send({ message: 'Internal Server Error fetching profile'});
    }
  }
} 