// Seat type definitions
export interface Seat {
  id: number;
  flight_id: number;
  seat_number: string;
  class: "economy" | "business";
  is_available: boolean;
  price: string;
}

export interface SeatCreateInput {
  flight_id: number;
  seat_number: string;
  class: "economy" | "business";
  is_available: boolean;
  price: string;
}

export interface SeatUpdateInput {
  seat_number?: string;
  class?: "economy" | "business";
  is_available?: boolean;
  price?: string;
}
