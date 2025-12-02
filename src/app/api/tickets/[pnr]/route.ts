import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { pnr: string } },
) {
	try {
		const pnr = params.pnr;

		// NOTE: Add your ticket retrieval logic here
		console.log({ pnr });

		// NOTE: Replace with your actual ticket data
		const ticket = {
			pnr,
			flight: {
				id: "1",
				airline_id: "1",
				airline_name: "Airline A",
				flight_number: "AA123",
				origin: "JFK",
				destination: "LAX",
				date: "2024-12-25",
				time: "08:00",
			},
			airline: {
				id: "1",
				name: "Airline A",
			},
			passengers: [
				{
					id: "1",
					name: "John Doe",
				},
			],
			amountPaid: 500,
			status: "confirmed",
		};

		return NextResponse.json(ticket);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
