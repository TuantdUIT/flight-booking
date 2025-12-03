import dayjs from "dayjs";
import { z } from "zod";

export const flightSearchSchema = z
	.object({
		origin: z.string().min(1, { message: "Please select an origin" }),
		destination: z.string().min(1, { message: "Please select a destination" }),
		departureDate: z
			.string()
			.min(1, { message: "Please select a departure date" }),
		passengers: z
			.number()
			.int()
			.min(1, { message: "At least one passenger is required" })
			.max(9, { message: "Please select between 1 and 9 passengers" }),
	})
	.refine((data) => data.origin !== data.destination, {
		message: "Origin and destination cannot be the same",
		path: ["destination"],
	})
	.refine(
		(data) => {
			const selectedDate = dayjs(data.departureDate);
			const today = dayjs().startOf("day");
			return selectedDate.isAfter(today) || selectedDate.isSame(today, "day");
		},
		{
			message: "Departure date cannot be in the past",
			path: ["departureDate"],
		},
	);

export type FlightSearchSchema = z.infer<typeof flightSearchSchema>;
