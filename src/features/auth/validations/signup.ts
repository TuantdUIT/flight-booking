import { z } from "zod";

export const SignUpSchema = z
	.object({
		email: z
			.string()
			.min(1, "Email is required")
			.email("Please enter a valid email address"),
		password: z
			.string()
			.min(6, "Password must be at least 6 characters long")
			.max(100, "Password must be less than 100 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type SignUpFormData = z.infer<typeof SignUpSchema>;
