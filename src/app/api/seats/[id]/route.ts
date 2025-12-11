import { toJsonResponse, err, errors } from "@/core/lib/http/result";
import { seatsService } from "@/features/seats/services/seats.service";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const requestId = crypto.randomUUID();
  const { id } = await params;

  const result = await seatsService.getSeatById(Number(id));
  const response = toJsonResponse(result, { requestId });

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const requestId = crypto.randomUUID();
  const { id } = await params;

  try {
    const body = await request.json();
    const { seat_number, class: seatClass, is_available, price } = body;

    const result = await seatsService.updateSeat(Number(id), {
      seat_number,
      class: seatClass,
      is_available,
      price: price !== undefined ? String(price) : undefined,
    });

    const response = toJsonResponse(result, { requestId });
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    const response = toJsonResponse(
      err(errors.internalError("Failed to update seat")),
      { requestId }
    );
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const requestId = crypto.randomUUID();
  const { id } = await params;

  const result = await seatsService.deleteSeat(Number(id));
  const response = toJsonResponse(result, { requestId });

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
