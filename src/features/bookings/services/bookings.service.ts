import { CreateBookingSchema } from '../validations/create-booking';

export class BookingsService {
  async createBooking(bookingData: CreateBookingSchema) {
    // NOTE: Add your booking creation logic here
    console.log(bookingData);

    // NOTE: Replace with your actual booking data
    return {
      bookingId: '12345',
      pnr: 'ABCDEF',
      status: 'CONFIRMED',
    };
  }
}

export const bookingsService = new BookingsService();
