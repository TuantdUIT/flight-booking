export interface User {
	id: string;
	email: string;
	name: string;
}

export interface Flight {
	id: string;
	flightNumber: string;
	airline: string;
	origin: string;
	destination: string;
	departureTime: string;
	arrivalTime: string;
	duration: string;
	price: number;
	seatsRemaining: number;
}

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
	flight: Flight;
	passengers: Passenger[];
	totalPrice: number;
	status: "confirmed" | "pending" | "cancelled";
	createdAt: string;
}

export interface SearchParams {
	origin: string;
	destination: string;
	departureDate: string;
	passengers: number;
}
