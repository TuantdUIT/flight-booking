import { errors, toJsonResponse } from "@/core/lib/http/result";
import { flightsService } from "@/features/flights/services/flights.service";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
	const requestId = crypto.randomUUID();
	const { id } = await params;
	const flightId = Number.parseInt(id, 10);

	if (Number.isNaN(flightId)) {
		const response = toJsonResponse(
			{ ok: false, error: errors.validationError("Invalid flight ID") },
			{ requestId },
		);

		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	}

	// Check for query param to get all seats or just available
	const url = new URL(request.url);
	const includeUnavailable = url.searchParams.get("all") === "true";

	const result = includeUnavailable
		? await flightsService.getAllSeats(flightId)
		: await flightsService.getAvailableSeats(flightId);

	const response = toJsonResponse(result, { requestId });

	return new NextResponse(response.body, {
		status: response.status,
		headers: response.headers,
	});
}
