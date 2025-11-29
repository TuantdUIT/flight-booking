import { LoginSchema } from '../validations/login';

export class AuthService {
  async login(credentials: LoginSchema) {
    // NOTE: Add your authentication logic here
    console.log(credentials);

    // NOTE: Replace with your actual token generation
    const accessToken = 'sample-jwt-token';
    const expiresIn = 3600;

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }
}

export const authService = new AuthService();
