"use client";

import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin } from "../hooks/use-login";
import { LoginSchema, type LoginFormData } from "../validations/login";

export function LoginForm() {
	const [showPassword, setShowPassword] = useState(false);
	const { mutate: login, isPending, error } = useLogin();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = (data: LoginFormData) => {
		login(data);
	};

	return (
		<div className="w-full max-w-md mx-auto space-y-6">
			<div className="text-center space-y-2">
				<h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
				<p className="text-muted-foreground">
					Sign in to your account to continue
				</p>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				{error && (
					<Alert variant="destructive">
						<AlertDescription>{error.message}</AlertDescription>
					</Alert>
				)}

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							id="email"
							type="email"
							placeholder="Enter your email"
							className="pl-10"
							disabled={isPending}
							{...register("email")}
						/>
					</div>
					{errors.email && (
						<p className="text-sm text-destructive">{errors.email.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="Enter your password"
							className="pl-10 pr-10"
							disabled={isPending}
							{...register("password")}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
							disabled={isPending}
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					</div>
					{errors.password && (
						<p className="text-sm text-destructive">
							{errors.password.message}
						</p>
					)}
				</div>

				<Button type="submit" className="w-full" disabled={isPending}>
					{isPending ? (
						<>
							<LoadingSpinner className="mr-2 h-4 w-4" />
							Signing in...
						</>
					) : (
						"Sign In"
					)}
				</Button>
			</form>

			<div className="text-center text-sm text-muted-foreground">
				Don't have an account?{" "}
				<Link
					href="/auth/register"
					className="font-medium text-primary hover:underline"
				>
					Sign up
				</Link>
			</div>
		</div>
	);
}
