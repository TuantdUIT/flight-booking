import { auth } from "@/core/lib/auth";
import type { BetterAuthSession } from "@/core/lib/auth/client";
import { NextRequest, NextResponse } from "next/server";

// Infer types from your existing better-auth setup
type SessionData = BetterAuthSession;

export interface AuthContext {
	user: SessionData["user"];
	session: SessionData["session"];
}

// Follows your Result<T, E> pattern philosophy
export type ProtectedHandler<TParams = void> = (
	req: NextRequest,
	ctx: TParams extends void
		? { auth: AuthContext }
		: { auth: AuthContext; params: TParams }
) => Promise<NextResponse>;

// Role-based access for admin dashboard features
export type Role = "user" | "admin" | "moderator";

export interface RoleProtectedHandler<TParams = void> {
	handler: ProtectedHandler<TParams>;
	allowedRoles: Role[];
}

async function getSession(req: NextRequest): Promise<AuthContext | null> {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) return null;
	return { user: session.user, session: session.session };
}

/**
 * Wraps API routes with authentication.
 * Follows the project's Clean Architecture principles.
 */
export function withAuth<TParams = void>(handler: ProtectedHandler<TParams>) {
	return async (
		req: NextRequest,
		context: { params: Promise<TParams> }
	): Promise<NextResponse> => {
		const authCtx = await getSession(req);

		if (!authCtx) {
			return NextResponse.json(
				{ success: false, error: { code: "AUTH_REQUIRED", message: "Unauthorized" } },
				{ status: 401 }
			);
		}

		const params = await context.params;
		return handler(req, { auth: authCtx, params } as any);
	};
}

/**
 * Wraps API routes with authentication + role check.
 * Used for admin dashboard endpoints.
 */
export function withRole<TParams = void>(
	allowedRoles: Role[],
	handler: ProtectedHandler<TParams>
) {
	return withAuth<TParams>(async (req, ctx) => {
		const userRole = (ctx.auth.user as any).role ?? "user";

		if (!allowedRoles.includes(userRole)) {
			return NextResponse.json(
				{ success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
				{ status: 403 }
			);
		}

		return handler(req, ctx);
	});
}
