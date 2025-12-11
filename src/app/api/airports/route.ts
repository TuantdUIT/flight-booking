import { errors, toJsonResponse } from "@/core/lib/http/result";
import { flightsService } from "@/features/flights/services/flights.service";
import { NextResponse } from "next/server";

export async function GET() {
	const requestId = crypto.randomUUID();

	// Get unique airports from both origins and destinations in flights table
	const [originsResult, destinationsResult] = await Promise.all([
		flightsService.getOrigins(),
		flightsService.getDestinations(),
	]);

	if (!originsResult.ok) {
		const response = toJsonResponse(originsResult, { requestId });
		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	}

	if (!destinationsResult.ok) {
		const response = toJsonResponse(destinationsResult, { requestId });
		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	}

	// Combine and deduplicate airports from origins and destinations
	const allAirports = [...new Set([...originsResult.value, ...destinationsResult.value])].sort();

	const response = toJsonResponse({ ok: true, value: allAirports }, { requestId });

	return new NextResponse(response.body, {
		status: response.status,
		headers: response.headers,
	});
}
