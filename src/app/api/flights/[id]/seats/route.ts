import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const flightId = params.id;

		// NOTE: Add your seat retrieval logic here
		console.log({ flightId });

		// NOTE: Replace with your actual seat data
		const seats = {
			totalSeats: 150,
			availableSeats: 50,
			seatMap: [
				{ seat: "1A", available: true },
				{ seat: "1B", available: false },
			],
		};

		return NextResponse.json(seats);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
