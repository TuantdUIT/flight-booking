import http from '@/core/lib/http';
import { LoginSchema } from '../validations/login';

export const login = async (credentials: LoginSchema) => {
  return await http.post('/api/auth/login', credentials);
};
