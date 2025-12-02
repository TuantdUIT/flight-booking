"use server";

import { AuthError } from "next-auth";
import { signIn } from "../config/auth";
import { LoginSchema, type LoginFormData } from "../validations/login";
import { redirect } from "next/navigation";

export interface LoginActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
}

export async function loginAction(
  values: LoginFormData
): Promise<LoginActionResult> {
  try {
    // Validate input
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        success: false,
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { email, password } = validatedFields.data;

    // Attempt to sign in
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: "Invalid email or password",
          };
        default:
          return {
            success: false,
            error: "Something went wrong. Please try again.",
          };
      }
    }

    // If it's a redirect (successful login), re-throw it
    throw error;
  }
}

export async function logoutAction() {
  redirect("/api/auth/signout");
}