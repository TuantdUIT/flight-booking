import { auth } from "@/core/lib/auth";
import { SessionUser } from "@/core/types/auth";
import { headers } from "next/headers";

export type ProtectedHandler = (
	req: Request,
	params: any, // Next.js route params
	user: SessionUser, // Injected guaranteed user
) => Promise<Response>;

export function protectedRoute(
	handler: ProtectedHandler,
	requiredRole?: "admin",
) {
	return async (req: Request, context: any) => {
		try {
			// 1. Verify Identity
			const session = await auth.api.getSession({
				headers: await headers(),
			});

			if (!session?.user) {
				return Response.json(
					{
						success: false,
						error: { code: "UNAUTHORIZED", message: "Authentication required" },
					},
					{ status: 401 },
				);
			}

			const user: SessionUser = {
				id: session.user.id,
				email: session.user.email,
				name: session.user.name,
				role: (session.user.role as "admin" | "user") || "user",
			};

			// 2. Verify Scope (RBAC)
			if (requiredRole && user.role !== requiredRole) {
				return Response.json(
					{
						success: false,
						error: { code: "FORBIDDEN", message: "Insufficient permissions" },
					},
					{ status: 403 },
				);
			}

			// 3. Execute Business Logic
			return await handler(req, context, user);
		} catch (error) {
			// 4. Global Error Boundary
			console.error(`[Route Error] ${req.url}:`, error);
			return Response.json(
				{
					success: false,
					error: { code: "INTERNAL_ERROR", message: "Processing failed" },
				},
				{ status: 500 },
			);
		}
	};
}
