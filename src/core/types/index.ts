import type { FlightWithAirline } from "@/features/flights/services/flights.service";

export interface User {
	id: string;
	email: string;
	name: string;
}

// Re-export Flight type from the service to ensure consistency
export type { FlightWithAirline as Flight } from "@/features/flights/services/flights.service";

export interface Passenger {
	id: string;
	fullName: string;
	dateOfBirth: string;
	nationality: string;
	passportNumber: string;
	email: string;
	phoneNumber: string;
	eTicketNumber?: string;
}

export interface Booking {
	id: string;
	pnr: string;
	flight: FlightWithAirline;
	passengers: Passenger[];
	totalPrice: number;
	status: "confirmed" | "pending" | "cancelled";
	createdAt: string;
}

// Re-export SearchParams from the validation schema to ensure consistency
export type { FlightSearchSchema as SearchParams } from "@/features/flights/validations/flight-search";
