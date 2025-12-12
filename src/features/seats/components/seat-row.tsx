"use client";

import type { Seat as SeatType } from "@/core/types/seat";
import { Seat } from "./seat";

interface SeatRowProps {
	rowNumber: number;
	seats: SeatType[];
	selectedSeatIds: number[];
	onSeatClick: (seat: SeatType) => void;
	isBusiness: boolean;
	disabled?: boolean;
}

export function SeatRow({
	rowNumber,
	seats,
	selectedSeatIds,
	onSeatClick,
	isBusiness,
	disabled,
}: SeatRowProps) {
	const leftSeats = isBusiness
		? seats.filter((s) => ["A", "C"].includes(s.seat_number.slice(-1)))
		: seats.filter((s) => ["A", "B", "C"].includes(s.seat_number.slice(-1)));

	const rightSeats = isBusiness
		? seats.filter((s) => ["D", "F"].includes(s.seat_number.slice(-1)))
		: seats.filter((s) => ["D", "E", "F"].includes(s.seat_number.slice(-1)));

	const sortByLetter = (a: SeatType, b: SeatType) =>
		a.seat_number.localeCompare(b.seat_number);

	return (
		<div className="flex items-center justify-center gap-2">
			<div className={`flex gap-1 ${isBusiness ? "gap-2" : "gap-1"}`}>
				{leftSeats.sort(sortByLetter).map((seat) => (
					<Seat
						key={seat.id}
						seat={seat}
						isSelected={selectedSeatIds.includes(seat.id)}
						onClick={() => onSeatClick(seat)}
						disabled={disabled}
					/>
				))}
			</div>
			<div className="w-10 flex items-center justify-center">
				<span className="text-xs font-medium text-gray-500">{rowNumber}</span>
			</div>
			<div className={`flex gap-1 ${isBusiness ? "gap-2" : "gap-1"}`}>
				{rightSeats.sort(sortByLetter).map((seat) => (
					<Seat
						key={seat.id}
						seat={seat}
						isSelected={selectedSeatIds.includes(seat.id)}
						onClick={() => onSeatClick(seat)}
						disabled={disabled}
					/>
				))}
			</div>
		</div>
	);
}
