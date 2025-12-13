import dayjs from "dayjs";
import { z } from "zod";

export const revenueFiltersSchema = z.object({
  fromDate: z.string().optional().refine(
    (v) => !v || dayjs(v).isValid(),
    { message: "Invalid from date format" }
  ),
  toDate: z.string().optional().refine(
    (v) => !v || dayjs(v).isValid(),
    { message: "Invalid to date format" }
  ),
}).refine(
  (data) => {
    if (data.fromDate && data.toDate) {
      return dayjs(data.fromDate).isBefore(dayjs(data.toDate)) || dayjs(data.fromDate).isSame(dayjs(data.toDate));
    }
    return true;
  },
  {
    message: "fromDate must be before or equal to toDate",
    path: ["toDate"],
  }
);

export type RevenueFiltersSchema = z.infer<typeof revenueFiltersSchema>;
