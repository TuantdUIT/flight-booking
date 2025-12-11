import { toJsonResponse } from "@/core/lib/http/result";
import { flightsService } from "@/features/flights/services/flights.service";
import { NextResponse } from "next/server";

export async function GET() {
	const requestId = crypto.randomUUID();

	const result = await flightsService.getAllAirlines();
	const response = toJsonResponse(result, { requestId });

	return new NextResponse(response.body, {
		status: response.status,
		headers: response.headers,
	});
}
