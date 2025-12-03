import { err, errors, ok, toJsonResponse } from "@/core/lib/http/result";
import { protectedRoute } from "@/core/lib/route-guard";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import { createBookingSchema } from "@/features/bookings/validations/create-booking";
import { NextResponse } from "next/server";

export const POST = protectedRoute(async (req, _context, user) => {
	const requestId = crypto.randomUUID();

	try {
		const body = await req.json();

		// Validate input data
		const validationResult = createBookingSchema.safeParse(body);
		if (!validationResult.success) {
			const result = err(
				errors.validationError(
					"Invalid booking data",
					validationResult.error.format(),
				),
			);
			const response = toJsonResponse(result, { requestId });
			return new NextResponse(response.body, {
				status: response.status,
				headers: response.headers,
			});
		}

		const bookingData = { ...validationResult.data, userId: user.id };
		const bookingResult = await bookingsService.createBooking(bookingData);

		if (!bookingResult.ok) {
			const response = toJsonResponse(bookingResult, { requestId });
			return new NextResponse(response.body, {
				status: response.status,
				headers: response.headers,
			});
		}

		const result = ok(bookingResult.value);
		const response = toJsonResponse(result, { requestId });

		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	} catch (error) {
		console.error("Error creating booking:", error);

		const result = err(errors.internalError("Failed to create booking"));
		const response = toJsonResponse(result, { requestId });

		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	}
});

export const GET = protectedRoute(async (req, _context, user) => {
	const requestId = crypto.randomUUID();

	try {
		const bookingsResult = await bookingsService.getUserBookings(user.id);

		if (!bookingsResult.ok) {
			const response = toJsonResponse(bookingsResult, { requestId });
			return new NextResponse(response.body, {
				status: response.status,
				headers: response.headers,
			});
		}

		const result = ok(bookingsResult.value);
		const response = toJsonResponse(result, { requestId });

		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	} catch (error) {
		console.error(`Error fetching bookings for user ${user.id}:`, error);

		const result = err(errors.internalError("Failed to fetch bookings"));
		const response = toJsonResponse(result, { requestId });

		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	}
});
