import { SignUpForm } from "@/features/auth/components/signup-form";
import { Suspense } from "react";
import { LoadingSpinner } from "@/core/components/ui/loading-spinner";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner text="Loading..." />
            </div>
          }
        >
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
