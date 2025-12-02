import { NextResponse } from "next/server";

export async function PATCH(
	request: Request,
	{ params }: { params: { pnr: string } },
) {
	try {
		const pnr = params.pnr;
		const { paymentMethod } = await request.json();

		// NOTE: Add your payment update logic here
		console.log({ pnr, paymentMethod });

		// NOTE: Replace with your actual payment data
		const payment = {
			pnr,
			paymentStatus: "paid",
			amountPaid: 500,
		};

		return NextResponse.json(payment);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
