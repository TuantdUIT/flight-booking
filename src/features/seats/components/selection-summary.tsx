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
      <Card className="w-full max-w-2xl">
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
    <Card className="w-full max-w-2xl">
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
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${
                  seat.class === "business"
                    ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                    : "bg-sky-100 text-sky-700 border-2 border-sky-300"
                }`}
              >
                {seat.seat_number}
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Class</p>
                  <p className="text-sm font-medium capitalize">{seat.class}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Row</p>
                  <p className="text-sm font-medium">{seat.seat_number.replace(/[A-Z]/g, "")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Position</p>
                  <p className="text-sm font-medium">
                    {getSeatPosition(seat.seat_number)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Price</p>
                <p className="text-base font-bold text-gray-900">{formatVND(parseFloat(seat.price))} ₫</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemoveSeat(seat.id)}
                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-4 border-t mt-3 px-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Amount</p>
            <p className="text-sm text-gray-600">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Total Price</p>
            <p className="text-2xl font-bold text-emerald-600">
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
