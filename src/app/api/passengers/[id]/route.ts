import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	try {
		const passengerId = params.id;

		// NOTE: Add your passenger retrieval logic here
		console.log({ passengerId });

		// NOTE: Replace with your actual passenger data
		const passenger = {
			id: passengerId,
			name: "John Doe",
			dob: "1990-01-01",
			nationality: "USA",
			passport: "A12345678",
		};

		return NextResponse.json(passenger);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
