export interface Flight {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  airlineName: string;
}

export interface FlightSearchResponse {
  data: Flight[];
  total: number;
}
