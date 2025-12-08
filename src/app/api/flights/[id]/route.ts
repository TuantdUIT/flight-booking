import { errors, toJsonResponse } from "@/core/lib/http/result";
import { flightsService } from "@/features/flights/services/flights.service";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
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

	const result = await flightsService.getFlightById(flightId);
	const response = toJsonResponse(result, { requestId });

	return new NextResponse(response.body, {
		status: response.status,
		headers: response.headers,
	});
}
