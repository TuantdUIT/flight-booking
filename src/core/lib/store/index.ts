"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
	User,
	Flight,
	Passenger,
	SearchParams,
	Booking,
} from "../../types";

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	login: (user: User, token: string) => void;
	logout: () => void;
}

interface BookingState {
	searchParams: SearchParams | null;
	selectedFlight: Flight | null;
	passengers: Passenger[];
	currentBooking: Booking | null;
	setSearchParams: (params: SearchParams) => void;
	setSelectedFlight: (flight: Flight | null) => void;
	setPassengers: (passengers: Passenger[]) => void;
	setCurrentBooking: (booking: Booking | null) => void;
	resetBooking: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			login: (user, token) => set({ user, token, isAuthenticated: true }),
			logout: () => set({ user: null, token: null, isAuthenticated: false }),
		}),
		{
			name: "auth-storage",
		},
	),
);

export const useBookingStore = create<BookingState>()((set) => ({
	searchParams: null,
	selectedFlight: null,
	passengers: [],
	currentBooking: null,
	setSearchParams: (params) => set({ searchParams: params }),
	setSelectedFlight: (flight) => set({ selectedFlight: flight }),
	setPassengers: (passengers) => set({ passengers }),
	setCurrentBooking: (booking) => set({ currentBooking: booking }),
	resetBooking: () =>
		set({
			searchParams: null,
			selectedFlight: null,
			passengers: [],
			currentBooking: null,
		}),
}));
