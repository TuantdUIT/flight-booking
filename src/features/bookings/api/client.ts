import { httpClient } from "@/core/lib/http";
import { err, ok } from "@/core/lib/http/result";
import type {
    AdminBooking,
    AdminBookingsResponse,
    BookingHistory,
} from "../types";
import type {
    BookingSearchSchema,
    BookingStatusUpdateSchema,
} from "../validations";

export const bookingsClient = {
  async getAdminBookings(filters: BookingSearchSchema) {
    try {
      const data = await httpClient.get(
        "/api/admin/bookings",
        { params: filters }
      );
      return ok(data as unknown as AdminBookingsResponse);
    } catch (e: any) {
      return err({
        code: "INTERNAL_ERROR",
        message: e?.message || "Failed to fetch bookings",
      });
    }
  },

  async updateBookingStatus(bookingId: number, data: BookingStatusUpdateSchema) {
    try {
      const result = await httpClient.patch(
        `/api/admin/bookings/${bookingId}/status`,
        data
      );
      return ok(result as unknown as AdminBooking);
    } catch (e: any) {
      return err({
        code: "INTERNAL_ERROR",
        message: e?.message || "Failed to update booking",
      });
    }
  },

  async getBookingHistory(bookingId: number) {
    try {
      const data = await httpClient.get(
        `/api/admin/bookings/${bookingId}/history`
      );
      return ok(data as unknown as BookingHistory[]);
    } catch (e: any) {
      return err({
        code: "INTERNAL_ERROR",
        message: e?.message || "Failed to fetch booking history",
      });
    }
  },

  async getUserBookings(userId: string) {
    try {
      const data = await httpClient.get(
        "/api/bookings",
        { params: { userId } }
      );
      return ok(data as unknown as AdminBooking[]);
    } catch (e: any) {
      return err({
        code: "INTERNAL_ERROR",
        message: e?.message || "Failed to fetch user bookings",
      });
    }
  },

  async getBookingById(id: string) {
    try {
      const data = await httpClient.get(`/api/bookings/${id}`);
      return ok(data as unknown as AdminBooking);
    } catch (e: any) {
      return err({
        code: "INTERNAL_ERROR",
        message: e?.message || "Failed to fetch booking",
      });
    }
  },

  async createBooking(data: unknown) {
    try {
      const result = await httpClient.post("/api/bookings", data);
      return ok(result as unknown as AdminBooking);
    } catch (e: any) {
      return err({
        code: "INTERNAL_ERROR",
        message: e?.message || "Failed to create booking",
      });
    }
  },

  async cancelBooking(id: string) {
    try {
      const result = await httpClient.post(
        `/api/bookings/${id}/cancel`,
        {}
      );
      return ok(result as unknown as AdminBooking);
    } catch (e: any) {
      return err({
        code: "INTERNAL_ERROR",
        message: e?.message || "Failed to cancel booking",
      });
    }
  },
};
