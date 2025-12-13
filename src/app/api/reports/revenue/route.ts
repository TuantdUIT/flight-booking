import { err, errors, ok, toJsonResponse } from "@/core/lib/http/result";
import { db } from "@/infrastructure/db/client";
import { bookings } from "@/infrastructure/db/schema";
import { sql } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const requestId = crypto.randomUUID();

	try {
		const { searchParams } = new URL(request.url);
		const fromDate = searchParams.get("fromDate");
		const toDate = searchParams.get("toDate");

		// Build date filter
		let dateFilter = sql`TRUE`;
		if (fromDate || toDate) {
			const conditions = [];
			if (fromDate) {
				conditions.push(sql`${bookings.createdAt} >= ${fromDate}`);
			}
			if (toDate) {
				conditions.push(sql`${bookings.createdAt} <= ${toDate}`);
			}
			dateFilter = sql.join(conditions, sql` AND `);
		}

		// Get overall revenue statistics
		const overallStats = await db
			.select({
				totalRevenue: sql<number>`COALESCE(SUM(${bookings.amountPaid}), 0)`,
				totalBookings: sql<number>`COUNT(*)`,
				confirmedBookings: sql<number>`COUNT(CASE WHEN ${bookings.bookingStatus} = 'confirmed' THEN 1 END)`,
				cancelledBookings: sql<number>`COUNT(CASE WHEN ${bookings.bookingStatus} = 'failed' THEN 1 END)`,
				pendingBookings: sql<number>`COUNT(CASE WHEN ${bookings.bookingStatus} = 'pending' THEN 1 END)`,
			})
			.from(bookings)
			.where(sql`${bookings.paymentStatus} = 'paid' AND ${dateFilter}`);

		// Revenue by month (last 12 months)
		const monthlyRevenue = await db
			.select({
				month: sql<string>`TO_CHAR(${bookings.createdAt}, 'YYYY-MM')`,
				revenue: sql<number>`COALESCE(SUM(${bookings.amountPaid}), 0)`,
				bookings: sql<number>`COUNT(*)`,
			})
			.from(bookings)
			.where(sql`${bookings.paymentStatus} = 'paid'`)
			.groupBy(sql`TO_CHAR(${bookings.createdAt}, 'YYYY-MM')`)
			.orderBy(sql`TO_CHAR(${bookings.createdAt}, 'YYYY-MM') DESC`)
			.limit(12);

		// Revenue by airline
		const airlineRevenue = await db
			.select({
				airlineId: sql<number>`${bookings.airlineId}`,
				airlineName: sql<string>`'Airline ' || CAST(${bookings.airlineId} AS TEXT)`, // Placeholder - would need airline table join
				revenue: sql<number>`COALESCE(SUM(${bookings.amountPaid}), 0)`,
				bookings: sql<number>`COUNT(*)`,
			})
			.from(bookings)
			.where(sql`${bookings.paymentStatus} = 'paid' AND ${dateFilter}`)
			.groupBy(bookings.airlineId)
			.orderBy(sql`COALESCE(SUM(${bookings.amountPaid}), 0) DESC`);

		// Revenue by route (origin-destination)
		const routeRevenue = await db
			.select({
				route: sql<string>`'Route ' || CAST(${bookings.flightId} AS TEXT)`, // Placeholder - would need flight table join
				revenue: sql<number>`COALESCE(SUM(${bookings.amountPaid}), 0)`,
				bookings: sql<number>`COUNT(*)`,
			})
			.from(bookings)
			.where(sql`${bookings.paymentStatus} = 'paid' AND ${dateFilter}`)
			.groupBy(bookings.flightId)
			.orderBy(sql`COALESCE(SUM(${bookings.amountPaid}), 0) DESC`)
			.limit(10);

		const stats = overallStats[0];

		const response = {
			summary: {
				totalRevenue: Number(stats.totalRevenue),
				totalBookings: Number(stats.totalBookings),
				confirmedBookings: Number(stats.confirmedBookings),
				cancelledBookings: Number(stats.cancelledBookings),
				pendingBookings: Number(stats.pendingBookings),
				confirmationRate: stats.totalBookings > 0
					? Number(((stats.confirmedBookings / stats.totalBookings) * 100).toFixed(2))
					: 0,
			},
			monthlyRevenue: monthlyRevenue.map(item => ({
				month: item.month,
				revenue: Number(item.revenue),
				bookings: Number(item.bookings),
			})),
			airlineRevenue: airlineRevenue.map(item => ({
				airlineId: item.airlineId,
				airlineName: item.airlineName,
				revenue: Number(item.revenue),
				bookings: Number(item.bookings),
			})),
			routeRevenue: routeRevenue.map(item => ({
				route: item.route,
				revenue: Number(item.revenue),
				bookings: Number(item.bookings),
			})),
			filters: {
				fromDate,
				toDate,
			},
		};

		const result = ok(response);
		const apiResponse = toJsonResponse(result, { requestId });

		return new Response(apiResponse.body, {
			status: apiResponse.status,
			headers: apiResponse.headers,
		});
	} catch (error) {
		console.error("Error fetching revenue statistics:", error);

		const result = err(errors.internalError("Failed to fetch revenue statistics"));
		const response = toJsonResponse(result, { requestId });

		return new Response(response.body, {
			status: response.status,
			headers: response.headers,
		});
	}
}
