import { toJsonResponse, err, errors } from "@/core/lib/http/result";
import { seatsService } from "@/features/seats/services/seats.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const { searchParams } = new URL(request.url);
  const flightId = searchParams.get("flightId");

  if (!flightId) {
    const response = toJsonResponse(
      err(errors.validationError("flightId is required")),
      { requestId }
    );
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }

  const result = await seatsService.getSeatsByFlightId(Number(flightId));
  const response = toJsonResponse(result, { requestId });

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const { flight_id, seat_number, class: seatClass, is_available, price } = body;

    if (!flight_id || !seat_number || !seatClass || price === undefined) {
      const response = toJsonResponse(
        err(errors.validationError("Missing required fields")),
        { requestId }
      );
      return new NextResponse(response.body, {
        status: response.status,
        headers: response.headers,
      });
    }

    const result = await seatsService.createSeat({
      flight_id,
      seat_number,
      class: seatClass,
      is_available: is_available ?? true,
      price: String(price),
    });

    const response = toJsonResponse(result, { requestId });
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    const response = toJsonResponse(
      err(errors.internalError("Failed to create seat")),
      { requestId }
    );
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }
}
