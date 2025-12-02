import http from '@/core/lib/http';
import { LoginFormData } from '../validations/login';
import { SignUpFormData } from '../validations/signup';

export const login = async (credentials: LoginFormData) => {
  return await http.post('/api/auth/login', credentials);
};

export const signup = async (credentials: SignUpFormData) => {
  return await http.post('/auth/signup', credentials);
};
