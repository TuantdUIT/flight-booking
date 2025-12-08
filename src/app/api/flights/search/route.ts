import { errors, toJsonResponse } from "@/core/lib/http/result";
import { flightsService } from "@/features/flights/services/flights.service";
import { flightSearchSchema } from "@/features/flights/validations/flight-search";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const requestId = crypto.randomUUID();

	try {
		const body = await request.json();
		const parseResult = flightSearchSchema.safeParse(body);

		if (!parseResult.success) {
			const response = toJsonResponse(
				{
					ok: false,
					error: errors.validationError("Invalid search parameters", {
						issues: parseResult.error.issues,
					}),
				},
				{ requestId },
			);

			return new NextResponse(response.body, {
				status: response.status,
				headers: response.headers,
			});
		}

		const result = await flightsService.searchFlights(parseResult.data);
		const response = toJsonResponse(result, { requestId });

		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	} catch (error) {
		console.error("Error in flight search:", error);

		const response = toJsonResponse(
			{ ok: false, error: errors.internalError("Failed to process request") },
			{ requestId },
		);

		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	}
}
