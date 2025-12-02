export class TicketsService {
	async getTicketByPnr(pnr: string) {
		// NOTE: Add your ticket retrieval logic here
		console.log(pnr);

		// NOTE: Replace with your actual ticket data
		return {
			pnr,
			flightId: "1",
			passengerName: "John Doe",
			seat: "1A",
		};
	}

	async downloadTicket(pnr: string) {
		// NOTE: Add your ticket download logic here
		console.log(pnr);

		// NOTE: Replace with your actual ticket file
		return new Blob(["Ticket content"], { type: "application/pdf" });
	}
}

export const ticketsService = new TicketsService();
