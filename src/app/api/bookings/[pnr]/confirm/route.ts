import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	{ params }: { params: { pnr: string } },
) {
	try {
		const pnr = params.pnr;

		// NOTE: Add your booking confirmation logic here
		console.log({ pnr });

		// NOTE: Replace with your actual booking data
		const booking = {
			pnr,
			bookingStatus: "confirmed",
			ticket: "sample-ticket-data",
		};

		return NextResponse.json(booking);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
