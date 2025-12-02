import { NextResponse } from "next/server";
import { flightsService } from "@/features/flights/services/flights.service";
import { flightSearchSchema } from "@/features/flights/validations/flight-search";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const searchParams = flightSearchSchema.parse(body);
		const flights = await flightsService.searchFlights(searchParams);
		return NextResponse.json({ flights });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
