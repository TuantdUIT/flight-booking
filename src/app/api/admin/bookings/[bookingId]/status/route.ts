import { withRole } from "@/core/lib/api/protect";
import { auditService } from "@/features/audit/services/audit.service";
import { bookingsRepository } from "@/features/bookings/repository";
import { NextRequest, NextResponse } from "next/server";

type Params = { bookingId: string };

const handler = async (req: NextRequest, { auth, params }: { auth: any; params: Params }) => {
	try {
		const bookingId = parseInt(params.bookingId);
		if (isNaN(bookingId)) {
			return NextResponse.json(
				{ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid booking ID" } },
				{ status: 400 }
			);
		}

		// Get current booking
		const currentBooking = await bookingsRepository.findBookingById(bookingId);
		if (!currentBooking) {
			return NextResponse.json(
				{ success: false, error: { code: "NOT_FOUND", message: "Booking not found" } },
				{ status: 404 }
			);
		}

		// Parse request body
		const body = await req.json();
		const { status, reason } = body;

		if (!status || !["pending", "confirmed", "failed"].includes(status)) {
			return NextResponse.json(
				{ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid status" } },
				{ status: 400 }
			);
		}

		// Update booking status
		const updatedBooking = await bookingsRepository.updateBooking(bookingId, {
			bookingStatus: status,
		});

		// Log the action in audit trail
		await auditService.logAction({
			userId: auth.user.id,
			action: "UPDATE",
			entityType: "booking",
			entityId: bookingId.toString(),
			details: JSON.stringify({
				oldStatus: currentBooking.bookingStatus,
				newStatus: status,
				reason: reason || "Status updated by admin",
				adminId: auth.user.id,
				adminName: auth.user.name,
			}),
		});

		return NextResponse.json({
			success: true,
			data: {
				booking: updatedBooking,
				message: `Booking status updated to ${status}`,
			},
		});
	} catch (error) {
		console.error("Error updating booking status:", error);
		return NextResponse.json(
			{ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update booking status" } },
			{ status: 500 }
		);
	}
};

export const PATCH = withRole<Params>(["admin"], handler);
