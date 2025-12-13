export interface RevenueReportResponse {
  totalRevenue: number;
  totalBookings: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  revenueByFlight: Array<{
    flightId: string;
    flightNumber: string;
    revenue: number;
    bookings: number;
  }>;
}
