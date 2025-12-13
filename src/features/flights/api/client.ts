import { httpClient } from "@/core/lib/http";
import { err, ok } from "@/core/lib/http/result";
import { FlightSearchSchema } from "../validations";

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

export const flightsClient = {
  async searchFlights(params: FlightSearchSchema) {
    try {
      const data = await httpClient.get(
        "/api/flights/search",
        { params }
      );
      return ok(data as unknown as FlightSearchResponse);
    } catch (e: any) {
      return err({
        code: "INTERNAL_ERROR",
        message: e?.message || "Flight search failed",
      });
    }
  },

  async getFlightById(id: string) {
    try {
      const data = await httpClient.get(`/api/flights/${id}`);
      return ok(data as unknown as Flight);
    } catch (e: any) {
      return err({
        code: "INTERNAL_ERROR",
        message: e?.message || "Failed to fetch flight",
      });
    }
  },
};
