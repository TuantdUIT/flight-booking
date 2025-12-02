import { useMutation } from '@tanstack/react-query';
import { signup } from '../api/api';
import { SignUpFormData } from '../validations/signup';
import { useToast } from '@/core/lib/hooks/use-toast';
import { useRouter } from 'next/navigation';

export const useSignUp = () => {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: SignUpFormData) => signup(credentials),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'You have successfully signed up.',
      });
      router.push('/login');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response.data.message,
        variant: 'destructive',
      });
    },
  });
};
