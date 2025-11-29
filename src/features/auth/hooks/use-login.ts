import { useMutation } from '@tanstack/react-query';
import { login } from '../api/api';
import { LoginSchema } from '../validations/login';

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginSchema) => login(credentials),
  });
};
