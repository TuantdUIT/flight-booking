"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/core/components/ui/button";
import { SeatMap, SelectionSummary } from "@/features/seats/components";
import { useSeats } from "@/features/seats/hooks/use-seats";
import { useSeatSelectionStore } from "@/features/seats/store";
import { useBookingStore } from "@/core/lib/store";
import type { Seat } from "@/core/types/seat";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

function SelectSeatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const flightIdParam = searchParams.get("flightId");
  const flightId = flightIdParam ? Number(flightIdParam) : null;
  
  const { selectedSeats, toggleSeat, removeSeat, clearSelection } =
    useSeatSelectionStore();
  
  const { searchParams: bookingSearchParams } = useBookingStore();
  const passengerCount = bookingSearchParams?.passengers || 1;

  const { data: seats = [], isLoading, error } = useSeats(flightId);

  const handleSeatClick = (seat: Seat) => {
    if (!seat.is_available) {
      toast.error("This seat is not available");
      return;
    }
    
    // Check if trying to select more seats than passengers
    if (!selectedSeats.find(s => s.id === seat.id) && selectedSeats.length >= passengerCount) {
      toast.error(`You can only select ${passengerCount} seat${passengerCount > 1 ? 's' : ''} for ${passengerCount} passenger${passengerCount > 1 ? 's' : ''}`);
      return;
    }
    
    toggleSeat(seat);
  };

  const handleConfirm = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }
    
    if (selectedSeats.length < passengerCount) {
      toast.error(`Please select ${passengerCount} seat${passengerCount > 1 ? 's' : ''} for ${passengerCount} passenger${passengerCount > 1 ? 's' : ''}`);
      return;
    }
    
    router.push("/passengers");
  };

  const handleBack = () => {
    clearSelection();
    router.back();
  };

  if (!flightId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500">No flight selected</p>
        <Button onClick={() => router.push("/")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">Failed to load seats</p>
        <Button onClick={() => router.push("/")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Select Your Seats</h1>
          <p className="text-gray-500 text-sm">Flight #{flightId}</p>
          <div className="flex items-center gap-2 mt-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {selectedSeats.length} / {passengerCount} seat{passengerCount > 1 ? 's' : ''} selected
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* Seat Map - Left Side */}
        <div className="flex-shrink-0">
          <SeatMap
            seats={seats}
            selectedSeatIds={selectedSeats.map((s: Seat) => s.id)}
            onSeatClick={handleSeatClick}
          />
        </div>

        {/* Selection Summary - Right Side */}
        <div className="w-full lg:w-auto">
          <SelectionSummary
            selectedSeats={selectedSeats}
            onRemoveSeat={removeSeat}
            onClearAll={clearSelection}
            onConfirm={handleConfirm}
            requiredSeats={passengerCount}
          />
        </div>
      </div>
    </div>
  );
}

export default function SelectSeatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SelectSeatContent />
    </Suspense>
  );
}
