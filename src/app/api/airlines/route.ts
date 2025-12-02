import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		// NOTE: Add your airline retrieval logic here
		console.log("Fetching all airlines");

		// NOTE: Replace with your actual airline data
		const airlines = [
			{
				id: "1",
				name: "Airline A",
			},
			{
				id: "2",
				name: "Airline B",
			},
		];

		return NextResponse.json(airlines);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
