import { err, errors, ok, toJsonResponse } from "@/core/lib/http/result";
import { passengersService } from "@/features/passengers/services/passengers.service";
import { createPassengerSchema } from "@/features/passengers/validations/create-passenger";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const requestId = crypto.randomUUID();

	try {
		const body = await request.json();

		// Validate input data
		const validationResult = createPassengerSchema.safeParse(body);
		if (!validationResult.success) {
			const result = err(
				errors.validationError(
					"Invalid passenger data",
					validationResult.error.format(),
				),
			);
			const response = toJsonResponse(result, { requestId });
			return new NextResponse(response.body, {
				status: response.status,
				headers: response.headers,
			});
		}

		const passengerData = validationResult.data;
		const passenger = await passengersService.createPassenger(passengerData);

		const result = ok(passenger);
		const response = toJsonResponse(result, { requestId });

		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	} catch (error) {
		console.error("Error creating passenger:", error);

		const result = err(errors.internalError("Failed to create passenger"));
		const response = toJsonResponse(result, { requestId });

		return new NextResponse(response.body, {
			status: response.status,
			headers: response.headers,
		});
	}
}
