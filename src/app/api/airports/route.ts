import { err, errors, ok, toJsonResponse } from "@/core/lib/http/result";
import { airports } from "@/core/lib/mock-data";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		// Generate request ID for traceability
		const requestId = crypto.randomUUID();

		// In a real app, this would fetch from database with potential validation errors
		// For now, return mock data

		const result = ok(airports);
		const response = toJsonResponse(result, { requestId });

		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	} catch (error) {
		console.error("Error fetching airports:", error);

		const requestId = crypto.randomUUID();
		const result = err(errors.internalError("Failed to fetch airports"));
		const response = toJsonResponse(result, { requestId });

		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	}
}
