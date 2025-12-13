import { err, errors, toJsonResponse } from "@/core/lib/http/result";
import { protectedRoute } from "@/core/lib/route-guard";
import { auditService } from "@/features/audit/services/audit.service";

export const GET = protectedRoute(async (req, _context, user) => {
	const requestId = crypto.randomUUID();

	try {
		const { searchParams } = new URL(req.url);

		// Check if user is admin (you might want to add role checking)
		if (user.role !== "admin") {
			const result = err(errors.unauthorized("Admin access required"));
			const response = toJsonResponse(result, { requestId });
			return new Response(response.body, {
				status: response.status,
				headers: response.headers,
			});
		}

		const filters = {
			userId: searchParams.get("userId") || undefined,
			action: searchParams.get("action") || undefined,
			entityType: searchParams.get("entityType") || undefined,
			entityId: searchParams.get("entityId") || undefined,
			fromDate: searchParams.get("fromDate")
				? new Date(searchParams.get("fromDate")!)
				: undefined,
			toDate: searchParams.get("toDate")
				? new Date(searchParams.get("toDate")!)
				: undefined,
			limit: searchParams.get("limit")
				? parseInt(searchParams.get("limit")!)
				: 50,
			offset: searchParams.get("offset")
				? parseInt(searchParams.get("offset")!)
				: 0,
		};

		const result = await auditService.getAuditLogs(filters);
		const response = toJsonResponse(result, { requestId });

		return new Response(response.body, {
			status: response.status,
			headers: response.headers,
		});
	} catch (error) {
		console.error("Error fetching audit logs:", error);

		const result = err(errors.internalError("Failed to fetch audit logs"));
		const response = toJsonResponse(result, { requestId });

		return new Response(response.body, {
			status: response.status,
			headers: response.headers,
		});
	}
});

export const POST = protectedRoute(async (req, _context, user) => {
	const requestId = crypto.randomUUID();

	try {
		const body = await req.json();
		const { action, entityType, entityId, details } = body;

		if (!action || !entityType) {
			const result = err(errors.validationError("Action and entityType are required"));
			const response = toJsonResponse(result, { requestId });
			return new Response(response.body, {
				status: response.status,
				headers: response.headers,
			});
		}

		// Log the action
		const result = await auditService.logAction({
			userId: user.id,
			action,
			entityType,
			entityId,
			details: details ? JSON.stringify(details) : undefined,
			ipAddress: req.headers.get("x-forwarded-for") ||
				req.headers.get("x-real-ip") ||
				"unknown",
			userAgent: req.headers.get("user-agent") || undefined,
		});

		const response = toJsonResponse(result, { requestId });

		return new Response(response.body, {
			status: response.status,
			headers: response.headers,
		});
	} catch (error) {
		console.error("Error logging audit action:", error);

		const result = err(errors.internalError("Failed to log audit action"));
		const response = toJsonResponse(result, { requestId });

		return new Response(response.body, {
			status: response.status,
			headers: response.headers,
		});
	}
});
