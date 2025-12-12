/**
 * Bookings API - React Query Hooks
 *
 * This module provides React Query hooks for managing bookings.
 *
 * Queries:
 * - useBookingsQuery: Fetch all bookings for the authenticated user
 * - useBookingQuery: Fetch a single booking by ID
 * - useBookingByPnrQuery: Fetch a booking by PNR
 *
 * Mutations:
 * - useCreateBookingMutation: Create a new booking
 * - useCancelBookingMutation: Cancel a booking
 * - useUpdateBookingPaymentMutation: Update booking payment status
 * - useConfirmBookingMutation: Confirm a booking
 */

export {
	bookingKeys,
	useBookingByPnrQuery,
	useBookingQuery,
	useBookingsQuery,
} from "./queries";

export {
	useCancelBookingMutation,
	useConfirmBookingMutation,
	useCreateBookingMutation,
	useUpdateBookingPaymentMutation,
} from "./mutations";
