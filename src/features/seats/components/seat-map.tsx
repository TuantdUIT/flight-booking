"use client";

import { useMemo } from "react";
import type { Seat as SeatType } from "@/core/types/seat";
import { SeatRow } from "./seat-row";
import { Legend } from "./legend";
import { Plane } from "lucide-react";

interface SeatMapProps {
	seats: SeatType[];
	selectedSeatIds: number[];
	onSeatClick: (seat: SeatType) => void;
	disabled?: boolean;
}

export function SeatMap({
	seats,
	selectedSeatIds,
	onSeatClick,
	disabled,
}: SeatMapProps) {
	const seatsByRow = useMemo(() => {
		const grouped = new Map<number, SeatType[]>();

		for (const seat of seats) {
			const rowNum = parseInt(seat.seat_number.replace(/[A-Z]/g, ""), 10);
			if (!grouped.has(rowNum)) {
				grouped.set(rowNum, []);
			}
			grouped.get(rowNum)!.push(seat);
		}

		return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
	}, [seats]);

	const businessRows = seatsByRow.filter(([rowNum]) => rowNum <= 3);
	const economyRows = seatsByRow.filter(([rowNum]) => rowNum > 3);

	return (
		<div className="flex flex-col items-center">
			<div className="relative bg-white rounded-t-[100px] rounded-b-3xl shadow-xl border border-gray-200 p-6 pt-16 pb-8 min-w-[320px]">
				<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
					<div className="bg-gray-700 rounded-full p-3">
						<Plane className="w-6 h-6 text-white rotate-0" />
					</div>
				</div>

				<div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-8 bg-gradient-to-b from-gray-100 to-transparent rounded-t-full" />

				<div className="flex items-center justify-center gap-2 mb-4 text-xs font-semibold text-gray-500">
					<div className="flex gap-2 w-[88px] justify-center">
						<span className="w-8 text-center">A</span>
						<span className="w-8 text-center">B</span>
						<span className="w-8 text-center">C</span>
					</div>
					<div className="w-10" />
					<div className="flex gap-2 w-[88px] justify-center">
						<span className="w-8 text-center">D</span>
						<span className="w-8 text-center">E</span>
						<span className="w-8 text-center">F</span>
					</div>
				</div>

				{businessRows.length > 0 && (
					<div className="mb-6">
						<div className="text-center mb-3">
							<span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
								Business Class
							</span>
						</div>
						<div className="flex flex-col gap-2">
							{businessRows.map(([rowNum, rowSeats]) => (
								<SeatRow
									key={rowNum}
									rowNumber={rowNum}
									seats={rowSeats}
									selectedSeatIds={selectedSeatIds}
									onSeatClick={onSeatClick}
									isBusiness={true}
									disabled={disabled}
								/>
							))}
						</div>
					</div>
				)}

				{businessRows.length > 0 && economyRows.length > 0 && (
					<div className="flex items-center gap-4 my-4">
						<div className="flex-1 h-px bg-gray-300" />
						<span className="text-xs text-gray-400">EXIT</span>
						<div className="flex-1 h-px bg-gray-300" />
					</div>
				)}

				{economyRows.length > 0 && (
					<div>
						<div className="text-center mb-3">
							<span className="text-xs font-semibold text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
								Economy Class
							</span>
						</div>
						<div className="flex flex-col gap-2">
							{economyRows.map(([rowNum, rowSeats]) => (
								<SeatRow
									key={rowNum}
									rowNumber={rowNum}
									seats={rowSeats}
									selectedSeatIds={selectedSeatIds}
									onSeatClick={onSeatClick}
									isBusiness={false}
									disabled={disabled}
								/>
							))}
						</div>
					</div>
				)}

				<div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-4 h-32 bg-gray-300 rounded-l-lg opacity-50" />
				<div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-4 h-32 bg-gray-300 rounded-r-lg opacity-50" />
			</div>

			<div className="mt-6 w-full max-w-md">
				<Legend />
			</div>
		</div>
	);
}
