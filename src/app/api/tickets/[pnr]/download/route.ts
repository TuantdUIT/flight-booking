import { NextResponse } from "next/server";

export async function GET(
	request: Request,
	{ params }: { params: { pnr: string } },
) {
	try {
		const pnr = params.pnr;

		// NOTE: Add your PDF generation logic here
		console.log({ pnr });

		// NOTE: Replace with your actual PDF stream or base64 data
		const pdfPlaceholder = "This is a placeholder for the PDF ticket.";

		return new Response(pdfPlaceholder, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="ticket-${pnr}.pdf"`,
			},
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
