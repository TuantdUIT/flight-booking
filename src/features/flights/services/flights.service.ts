import { FlightSearchSchema } from "../validations/flight-search";

export class FlightsService {
	async searchFlights(searchParams: FlightSearchSchema) {
		// NOTE: Add your flight search logic here
		console.log(searchParams);

		// NOTE: Replace with your actual flight data
		return [
			{
				id: "1",
				flightNumber: "AI-202",
				airline: "Air India",
				origin: "New York (JFK)",
				destination: "London (LHR)",
				departureTime: "10:00",
				arrivalTime: "22:00",
				duration: "12h 0m",
				price: 500,
				seatsRemaining: 10,
			},
		];
	}
}

export const flightsService = new FlightsService();
