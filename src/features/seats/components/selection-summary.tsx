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
      <CardContent className="space-y-3">
        {selectedSeats.map((seat) => (
          <div
            key={seat.id}
            className="flex flex-wrap items-center gap-4 lg:gap-6 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {/* Seat Badge */}
            <div
              className={`w-16 h-16 lg:w-14 lg:h-14 rounded-lg flex items-center justify-center text-base font-bold shadow-sm flex-shrink-0 ${
                seat.class === "business"
                  ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                  : "bg-sky-100 text-sky-700 border-2 border-sky-300"
              }`}
            >
              {seat.seat_number}
            </div>

            {/* Seat Details - Single Horizontal Line on Desktop */}
            <div className="flex-1 flex flex-wrap items-center gap-x-6 gap-y-3 lg:gap-x-8 min-w-0">
              {/* Seat Number */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">Seat:</span>
                <span className="text-sm font-bold text-gray-900">{seat.seat_number}</span>
              </div>

              {/* Class */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">Class:</span>
                <span className="text-sm font-semibold text-gray-900 capitalize">{seat.class}</span>
              </div>

              {/* Row */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">Row:</span>
                <span className="text-sm font-semibold text-gray-900">{seat.seat_number.replace(/[A-Z]/g, "")}</span>
              </div>

              {/* Position */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">Position:</span>
                <span className="text-sm font-semibold text-gray-900">{getSeatPosition(seat.seat_number)}</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">Price:</span>
                <span className="text-sm font-bold text-emerald-600">{formatVND(parseFloat(seat.price))} ₫</span>
              </div>
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveSeat(seat.id)}
              className="h-10 w-10 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
              aria-label={`Remove seat ${seat.seat_number}`}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t mt-4 px-4">
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Total Amount</p>
            <p className="text-base font-semibold text-gray-700">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1.5">Total Price</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 leading-tight">
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
