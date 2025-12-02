import { LoadingSpinner } from "@/core/components/ui/loading-spinner";
import { LoginForm } from "@/features/auth/components/login-form";
import { Suspense } from "react";

export default function LoginPage() {
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
					<LoginForm />
				</Suspense>
			</div>
		</div>
	);
}
