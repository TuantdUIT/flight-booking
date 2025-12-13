import { withRole } from "@/core/lib/api/protect";
import { bookingsRepository } from "@/features/bookings/repository";
import { NextRequest, NextResponse } from "next/server";

type Params = void;

const handler = async (req: NextRequest, { auth }: { auth: any }) => {
	try {
		// Get query parameters
		const { searchParams } = new URL(req.url);
		const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
		const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);
		const status = searchParams.get("status");

		// Get bookings with related data
		const bookings = await bookingsRepository.findBookingsWithDetails(limit, offset, status);

		return NextResponse.json({
			success: true,
			data: {
				bookings,
				pagination: {
					limit,
					offset,
					hasMore: bookings.length === limit,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching admin bookings:", error);
		return NextResponse.json(
			{ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch bookings" } },
			{ status: 500 }
		);
	}
};

export const GET = withRole(["admin"], handler);
