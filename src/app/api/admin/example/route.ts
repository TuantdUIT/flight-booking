import { ok, toJsonResponse } from "@/core/lib/http/result";
import { protectedRoute } from "@/core/lib/route-guard";
import { NextResponse } from "next/server";

export const GET = protectedRoute(async (req, _context, user) => {
	const requestId = crypto.randomUUID();

	try {
		// Admin-only logic runs only if user.role === 'admin'
		console.log(
			`[AUDIT] Admin ${user.id} (${user.email}) accessed admin endpoint.`,
		);

		const result = ok({
			message: `Hello ${user.name || user.email}, you have admin access!`,
			timestamp: new Date().toISOString(),
		});

		const response = toJsonResponse(result, { requestId });
		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	} catch (error) {
		console.error(
			`[Route Error] Admin endpoint error for user ${user.id}:`,
			error,
		);
		throw error;
	}
}, "admin");
