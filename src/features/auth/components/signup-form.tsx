"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema, type SignUpFormData } from "../validations/signup";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useSignUp } from "@/features/auth/hooks/use-signup";

export function SignUpForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { mutate: signup, isPending, error } = useSignUp();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (data: SignUpFormData) => {
        signup(data);
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Create an Account</h1>
                <p className="text-muted-foreground">
                    Enter your details to get started
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
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
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="pl-10 pr-10"
                            disabled={isPending}
                            {...register("confirmPassword")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            disabled={isPending}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                            Signing up...
                        </>
                    ) : (
                        "Sign Up"
                    )}
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <a
                    href="/login"
                    className="font-medium text-primary hover:underline"
                >
                    Sign in
                </a>
            </div>
        </div>
    );
}
