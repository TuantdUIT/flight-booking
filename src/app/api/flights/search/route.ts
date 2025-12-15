import { errors, toJsonResponse } from "@/core/lib/http/result";
import { flightsService } from "@/features/flights/services/flights.service";
import { flightSearchSchema } from "@/features/flights/validations/flight-search";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const requestId = crypto.randomUUID();

	try {
		// Extract search params from URL query string
		const { searchParams } = new URL(request.url);
		
		const searchData = {
			origin: searchParams.get("origin") || "",
			destination: searchParams.get("destination") || "",
			departureDate: searchParams.get("departureDate") || "",
			passengers: Number(searchParams.get("passengers")) || 0,
		};

		// Validate with flightSearchSchema
		const parseResult = flightSearchSchema.safeParse(searchData);

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
		console.log(result)

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
