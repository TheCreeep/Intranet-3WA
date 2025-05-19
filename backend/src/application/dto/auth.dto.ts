import { BaseUserDto } from './user.dto';

export class LoginDto {
  email!: string;
  password!: string;
}

export class LoginResponseDto {
  user: BaseUserDto;
  token: string;

  constructor(user: BaseUserDto, token: string) {
    this.user = user;
    this.token = token;
  }
}

export interface JwtPayloadDto {
  id: string;
  email: string;
  isAdmin: boolean;
  iat?: number; // Issued at (added by jwt.sign)
  exp?: number; // Expiration time (added by jwt.sign)
} 