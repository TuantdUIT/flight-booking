"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { Button } from "@/core/components/ui/button";
import { SeatMap, SelectionSummary } from "@/features/seats/components";
import { useSeats } from "@/features/seats/hooks/use-seats";
import { useSeatSelectionStore } from "@/features/seats/store";
import { useBookingStore } from "@/core/lib/store";
import type { Seat } from "@/core/types/seat";
import { ArrowLeft, Loader2, Users, Clock, Calendar, Plane } from "lucide-react";
import { toast } from "sonner";

function SelectSeatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const flightIdParam = searchParams.get("flightId");
  const flightId = flightIdParam ? Number(flightIdParam) : null;
  
  const { selectedSeats, toggleSeat, removeSeat, clearSelection } =
    useSeatSelectionStore();
  
  const { searchParams: bookingSearchParams, selectedFlight } = useBookingStore();
  const passengerCount = bookingSearchParams?.passengers || 1;

  const { data: seats = [], isLoading, error } = useSeats(flightId);

  // Track the current flight ID to detect changes
  const previousFlightIdRef = useRef<number | null>(null);

  // Clear selected seats when flight changes or component unmounts
  useEffect(() => {
    // If flight ID changed (user selected a different flight)
    if (previousFlightIdRef.current !== null && previousFlightIdRef.current !== flightId) {
      clearSelection();
      toast.info("Seat selection cleared for new flight");
    }
    
    // Update the ref with current flight ID
    previousFlightIdRef.current = flightId;

    // Cleanup: Clear seats when leaving the page
    return () => {
      // Only clear if we're actually leaving (not just re-rendering)
      clearSelection();
    };
  }, [flightId, clearSelection]);

  // Format date to dd/mm/yyyy
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Select Your Seats</h1>
            <div className="flex items-center gap-2 mt-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {selectedSeats.length} / {passengerCount} seat{passengerCount > 1 ? 's' : ''} selected
              </span>
            </div>
          </div>
        </div>

        {/* Flight Information Card */}
        {selectedFlight && bookingSearchParams && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              {/* Flight Info */}
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Plane className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Flight</p>
                  <p className="font-semibold text-lg">{selectedFlight.flightNumber}</p>
                  <p className="text-sm text-gray-600">{selectedFlight.airline}</p>
                </div>
              </div>

              {/* Route Information */}
              <div className="flex items-center justify-center gap-12">
                {/* Origin */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">From</p>
                  <p className="text-sm font-medium text-gray-700">{selectedFlight.origin}</p>
                </div>

                {/* Flight Path - Centered */}
                <div className="flex flex-col items-center">
                  {/* Departure Time - Centered above plane */}
                  <div className="text-center mb-3">
                    <span className="text-2xl font-bold text-gray-900">{selectedFlight.departureTime}</span>
                  </div>
                  
                  {/* Plane Icon and Path */}
                  <div className="relative flex items-center">
                    <div className="w-32 border-t-2 border-dashed border-gray-300"></div>
                    <div className="absolute left-1/2 -translate-x-1/2">
                      <Plane className="w-6 h-6 text-blue-600 rotate-90" />
                    </div>
                  </div>
                  
                  {/* Direct Label */}
                  <div className="flex items-center gap-1 mt-3">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Direct</span>
                  </div>
                </div>

                {/* Destination */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">To</p>
                  <p className="text-sm font-medium text-gray-700">{selectedFlight.destination}</p>
                </div>
              </div>

              {/* Date */}
              <div className="text-right">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    {bookingSearchParams.departureDate ? formatDate(bookingSearchParams.departureDate) : 'N/A'}
                  </p>
                </div>
                <p className="text-xs text-gray-500">Departure Date</p>
              </div>
            </div>
          </div>
        )}
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
