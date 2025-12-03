// Enum types for booking-related entities
export type PaymentStatus = "pending" | "paid" | "failed";
export type BookingStatus = "pending" | "confirmed" | "failed";
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
