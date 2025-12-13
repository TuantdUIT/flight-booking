// Enum types for booking-related entities
export type PaymentStatus = "pending" | "paid" | "failed";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type SeatClass = "economy" | "business";

// Booking result types
export interface CreateBookingResult {
	bookingId: number;
	pnr: string;
	status: BookingStatus;
	totalAmount: number;
	passengersCount: number;
}

export interface BookingSummary {
	id: number;
	pnr: string;
	userId: string;
	flightId: number;
	airlineId: number;
	amountPaid: number;
	paymentStatus: PaymentStatus;
	bookingStatus: BookingStatus;
	passengers: BookingPassenger[];
}

export interface BookingPassenger {
	id: number;
	passengerId: number;
	seatId: number;
	passengerName: string;
	seatNumber: string;
	seatClass: SeatClass;
}

// Admin types
export interface AdminBooking {
	id: number;
	pnr: string;
	userId: string;
	flightId: number;
	status: BookingStatus;
	totalAmount: number;
	createdAt: string;
	updatedAt: string;
	passengers: BookingPassenger[];
}

export interface AdminBookingsResponse {
	data: AdminBooking[];
	total: number;
	limit: number;
	offset: number;
}

export interface BookingHistory {
	id: number;
	bookingId: number;
	action: string;
	details?: Record<string, unknown>;
	timestamp: string;
	userId?: string;
}
