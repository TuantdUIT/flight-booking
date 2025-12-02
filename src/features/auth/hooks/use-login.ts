"use client";

import { authClient } from "@/core/lib/auth/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type LoginFormData } from "../validations/login";

export function useLogin() {
	const router = useRouter();

	return useMutation({
		mutationFn: async (values: LoginFormData) => {
			const { data, error } = await authClient.signIn.email({
				email: values.email,
				password: values.password,
			});

			if (error) {
				throw new Error(error?.message || "Login failed");
			}

			return data;
		},
		onSuccess: () => {
			router.push("/");
			router.refresh();
		},
		onError: (error: Error) => {
			console.error("Login error:", error);
		},
	});
}
