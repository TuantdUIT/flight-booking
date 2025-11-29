"use client"

import type * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/src/core/lib/store"
import { InputField } from "@/src/core/components/ui/input-field"
import { Button } from "@/src/core/components/ui/button"
import { ErrorBanner } from "@/src/core/components/ui/error-banner"
import { LoadingSpinner } from "@/src/core/components/ui/loading-spinner"
import { Plane, Mail, Lock } from "lucide-react"
import Link from "next/link"

interface FormErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password.trim()) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError("")

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock successful login (in real app, call POST /basic-login)
      if (email === "demo@university.edu" && password === "password") {
        const mockUser = {
          id: "1",
          email: email,
          name: "Demo User",
        }
        const mockToken = "jwt-token-" + Math.random().toString(36).substr(2)

        login(mockUser, mockToken)
        router.push("/")
      } else {
        // For demo purposes, accept any valid email/password
        const mockUser = {
          id: "1",
          email: email,
          name: email.split("@")[0],
        }
        const mockToken = "jwt-token-" + Math.random().toString(36).substr(2)

        login(mockUser, mockToken)
        router.push("/")
      }
    } catch {
      setApiError("Login failed. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your UniAir account</p>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          {apiError && <ErrorBanner message={apiError} onDismiss={() => setApiError("")} className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Email"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              error={errors.email}
              icon={<Mail className="h-4 w-4" />}
              disabled={isLoading}
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              error={errors.password}
              icon={<Lock className="h-4 w-4" />}
              disabled={isLoading}
            />

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" className="text-primary-foreground" /> : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Demo: Use any valid email and password to login
          </p>
        </div>
      </div>
    </div>
  )
}
