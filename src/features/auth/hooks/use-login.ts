"use client";

import { useState } from "react";
import { signIn } from "../config/auth";
import { useRouter } from "next/navigation";
import { type LoginFormData } from "../validations/login";

export function useLogin() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  const login = async (values: LoginFormData) => {
    setError(undefined);
    setIsPending(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Login error:", error);
    } finally {
      setIsPending(false);
    }
  };

  return {
    login,
    isPending,
    error,
    setError,
  };
}
