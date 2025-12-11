// Seat selection store
import { create } from "zustand";
import type { Seat } from "@/core/types/seat";

interface SeatSelectionState {
  selectedSeats: Seat[];
  isAdminMode: boolean;
  addSeat: (seat: Seat) => void;
  removeSeat: (seatId: number) => void;
  toggleSeat: (seat: Seat) => void;
  clearSelection: () => void;
  setAdminMode: (isAdmin: boolean) => void;
}

export const useSeatSelectionStore = create<SeatSelectionState>((set, get) => ({
  selectedSeats: [],
  isAdminMode: false,

  addSeat: (seat) => {
    const { selectedSeats } = get();
    if (!selectedSeats.find((s) => s.id === seat.id)) {
      set({ selectedSeats: [...selectedSeats, seat] });
    }
  },

  removeSeat: (seatId) => {
    set((state) => ({
      selectedSeats: state.selectedSeats.filter((s) => s.id !== seatId),
    }));
  },

  toggleSeat: (seat) => {
    const { selectedSeats, addSeat, removeSeat } = get();
    const isSelected = selectedSeats.find((s) => s.id === seat.id);
    if (isSelected) {
      removeSeat(seat.id);
    } else {
      addSeat(seat);
    }
  },

  clearSelection: () => {
    set({ selectedSeats: [] });
  },

  setAdminMode: (isAdmin) => {
    set({ isAdminMode: isAdmin, selectedSeats: [] });
  },
}));
