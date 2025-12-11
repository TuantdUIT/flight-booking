"use client";

import { cn } from "@/core/utils";
import type { Seat as SeatType } from "@/core/types/seat";

interface SeatProps {
  seat: SeatType;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function Seat({ seat, isSelected, onClick, disabled }: SeatProps) {
  const isAvailable = seat.is_available;
  const isBusiness = seat.class === "business";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !isAvailable}
      className={cn(
        "relative flex items-center justify-center rounded-t-lg transition-all duration-200",
        "text-xs font-medium",
        isBusiness ? "w-10 h-12" : "w-8 h-10",
        "border-2 shadow-sm",
        isAvailable && !isSelected && isBusiness && [
          "bg-amber-100 border-amber-300 text-amber-800",
          "hover:bg-amber-200 hover:border-amber-400 hover:scale-105",
        ],
        isAvailable && !isSelected && !isBusiness && [
          "bg-sky-100 border-sky-300 text-sky-800",
          "hover:bg-sky-200 hover:border-sky-400 hover:scale-105",
        ],
        isSelected && [
          "bg-emerald-500 border-emerald-600 text-white",
          "ring-2 ring-emerald-300 ring-offset-1",
          "scale-105",
        ],
        !isAvailable && [
          "bg-gray-200 border-gray-300 text-gray-400",
          "cursor-not-allowed opacity-60",
        ],
        disabled && "pointer-events-none"
      )}
      title={`${seat.seat_number} - ${seat.class} - ${new Intl.NumberFormat('vi-VN').format(parseFloat(seat.price))} ₫`}
    >
      <span className="text-[10px] leading-none">{seat.seat_number}</span>
      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-current opacity-30 rounded-b" />
    </button>
  );
}
