"use client";

import { authClient } from "@/core/lib/auth/client";
import { useToast } from "@/core/lib/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SignUpFormData } from "../validations/signup";

export function useSignUp() {
	const { toast } = useToast();
	const router = useRouter();

	return useMutation({
		mutationFn: async (credentials: SignUpFormData) => {
			const { data, error } = await authClient.signUp.email({
				email: credentials.email,
				password: credentials.password,
				name: credentials.email,
			});

			if (error) {
				throw new Error(error?.message || "Sign up failed");
			}

			return data;
		},
		onSuccess: () => {
			toast({
				title: "Success",
				description: "You have successfully signed up.",
			});
			router.push("/auth/signin");
		},
		onError: (error: Error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
			console.error("Sign up error:", error);
		},
	});
}
