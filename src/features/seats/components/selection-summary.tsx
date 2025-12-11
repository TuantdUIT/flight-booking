"use client";

import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/core/components/ui/card";
import type { Seat } from "@/core/types/seat";
import { X, ArrowRight } from "lucide-react";

interface SelectionSummaryProps {
  selectedSeats: Seat[];
  onRemoveSeat: (seatId: number) => void;
  onClearAll: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  requiredSeats?: number;
}

export function SelectionSummary({
  selectedSeats,
  onRemoveSeat,
  onClearAll,
  onConfirm,
  isLoading,
  requiredSeats,
}: SelectionSummaryProps) {
  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + parseFloat(seat.price),
    0
  );

  // Format price in VND
  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  // Get seat position based on suffix
  const getSeatPosition = (seatNumber: string) => {
    const suffix = seatNumber.slice(-1);
    if (suffix === "A" || suffix === "F") {
      return "Window";
    } else if (suffix === "B" || suffix === "E") {
      return "Middle";
    } else if (suffix === "C" || suffix === "D") {
      return "Aisle";
    }
    return "Unknown";
  };

  const isComplete = requiredSeats ? selectedSeats.length === requiredSeats : selectedSeats.length > 0;

  if (selectedSeats.length === 0) {
    return (
      <Card className="w-full max-w-5xl">
        <CardContent className="py-8 text-center">
          <p className="text-gray-500 text-sm">
            Select seats from the map to continue
          </p>
          {requiredSeats && (
            <p className="text-gray-400 text-xs mt-2">
              You need to select {requiredSeats} seat{requiredSeats > 1 ? 's' : ''}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Selected Seats</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {selectedSeats.map((seat) => (
          <div
            key={seat.id}
            className="flex items-center gap-8 p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* Seat Badge - Larger */}
            <div
              className={`w-20 h-20 rounded-xl flex items-center justify-center text-lg font-bold shadow-md ${
                seat.class === "business"
                  ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                  : "bg-sky-100 text-sky-700 border-2 border-sky-300"
              }`}
            >
              {seat.seat_number}
            </div>

            {/* Seat Details Grid - 5 columns for more space */}
            <div className="flex-1 grid grid-cols-5 gap-8">
              <div>
                <p className="text-xs text-gray-500 mb-2">Seat Number</p>
                <p className="text-base font-bold">{seat.seat_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Class</p>
                <p className="text-base font-semibold capitalize">{seat.class}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Row</p>
                <p className="text-base font-semibold">{seat.seat_number.replace(/[A-Z]/g, "")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Position</p>
                <p className="text-base font-semibold">
                  {getSeatPosition(seat.seat_number)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Price</p>
                <p className="text-base font-bold text-gray-900">{formatVND(parseFloat(seat.price))} ₫</p>
              </div>
            </div>

            {/* Remove Button - Larger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveSeat(seat.id)}
              className="h-12 w-12 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        ))}

        <div className="flex items-center justify-between pt-6 border-t mt-4 px-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">Total Amount</p>
            <p className="text-lg font-semibold text-gray-700">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-2">Total Price</p>
            <p className="text-4xl font-bold text-emerald-600">
              {formatVND(totalPrice)} ₫
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        {requiredSeats && selectedSeats.length < requiredSeats && (
          <p className="text-xs text-amber-600 text-center w-full">
            Please select {requiredSeats - selectedSeats.length} more seat{requiredSeats - selectedSeats.length > 1 ? 's' : ''}
          </p>
        )}
        <Button
          onClick={onConfirm}
          disabled={isLoading || !isComplete}
          className="w-full"
        >
          Confirm Selection
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}
