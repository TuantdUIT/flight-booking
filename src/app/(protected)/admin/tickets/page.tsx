"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/core/components/ui/alert-dialog";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/core/components/ui/dropdown-menu";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { Edit, Eye, MoreHorizontal, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Ticket {
	bookingId: number;
	bookingStatus: string;
	paymentStatus: string;
	amountPaid: string | null;
	flightId: number;
	flightNumber: string;
	airline: string;
	origin: string;
	destination: string;
	date: Date;
	time: string;
	passengerId: number;
	passengerName: string | null;
	passengerEmail: string | null;
	passengerPhone: string | null;
	seatId: number;
	seatNumber: string;
	seatClass: string;
	seatPrice: string;
	createdAt: Date;
}

export default function TicketManagementPage() {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [editForm, setEditForm] = useState({
		passengerName: "",
		passengerEmail: "",
		passengerPhone: "",
		seatNumber: "",
	});

	useEffect(() => {
		loadTickets();
	}, []);

	const loadTickets = async () => {
		try {
			// For now, we'll fetch all bookings with passenger info
			// In a real implementation, you might want to add pagination and filtering
			const response = await fetch("/api/bookings");
			if (response.ok) {
				const data = await response.json();
				// Transform the data to match our Ticket interface
				// This would need to be adapted based on the actual API response structure
				setTickets([]);
			}
		} catch (error) {
			toast.error("Failed to load tickets");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = async () => {
		if (!searchTerm.trim()) {
			loadTickets();
			return;
		}

		try {
			// Search tickets by PNR, passenger name, or email
			const response = await fetch(`/api/bookings?search=${encodeURIComponent(searchTerm)}`);
			if (response.ok) {
				const data = await response.json();
				setTickets([]);
			}
		} catch (error) {
			toast.error("Search failed");
			console.error(error);
		}
	};

	const handleViewTicket = (ticket: Ticket) => {
		setSelectedTicket(ticket);
		setIsViewDialogOpen(true);
	};

	const handleEditTicket = (ticket: Ticket) => {
		setSelectedTicket(ticket);
		setEditForm({
			passengerName: ticket.passengerName || "",
			passengerEmail: ticket.passengerEmail || "",
			passengerPhone: ticket.passengerPhone || "",
			seatNumber: ticket.seatNumber,
		});
		setIsEditDialogOpen(true);
	};

	const handleUpdateTicket = async () => {
		if (!selectedTicket) return;

		try {
			// Update passenger and seat information
			const response = await fetch(`/api/bookings/${selectedTicket.bookingId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editForm),
			});

			if (response.ok) {
				toast.success("Ticket updated successfully");
				setIsEditDialogOpen(false);
				loadTickets();
			} else {
				throw new Error("Update failed");
			}
		} catch (error) {
			toast.error("Failed to update ticket");
			console.error(error);
		}
	};

	const handleDeleteTicket = async () => {
		if (!selectedTicket) return;

		try {
			const response = await fetch(`/api/bookings/${selectedTicket.bookingId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("Ticket deleted successfully");
				setIsDeleteDialogOpen(false);
				loadTickets();
			} else {
				throw new Error("Delete failed");
			}
		} catch (error) {
			toast.error("Failed to delete ticket");
			console.error(error);
		}
	};

	const filteredTickets = tickets.filter(ticket =>
		ticket.passengerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		ticket.passengerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		ticket.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (loading) {
		return <div className="flex justify-center items-center h-64">Loading...</div>;
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold">Ticket Management</h1>
					<p className="text-muted-foreground mt-2">
						Manage ticket information, search, edit, and delete tickets.
					</p>
				</div>
			</div>

			<div className="mb-6 flex gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by passenger name, email, or flight number..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
						onKeyPress={(e) => e.key === "Enter" && handleSearch()}
					/>
				</div>
				<Button onClick={handleSearch}>
					<Search className="h-4 w-4 mr-2" />
					Search
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Tickets ({filteredTickets.length})</CardTitle>
					<CardDescription>
						Complete list of all tickets in the system.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Flight</TableHead>
								<TableHead>Passenger</TableHead>
								<TableHead>Seat</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Booking Date</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{tickets.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-8">
										No tickets found. Use the search to find specific tickets.
									</TableCell>
								</TableRow>
							) : (
								filteredTickets.map((ticket) => (
									<TableRow key={`${ticket.bookingId}-${ticket.passengerId}`}>
										<TableCell>
											<div className="font-medium">{ticket.flightNumber}</div>
											<div className="text-sm text-muted-foreground">
												{ticket.origin} → {ticket.destination}
											</div>
											<div className="text-sm text-muted-foreground">
												{new Date(ticket.date).toLocaleDateString()} {ticket.time}
											</div>
										</TableCell>
										<TableCell>
											<div className="font-medium">{ticket.passengerName}</div>
											<div className="text-sm text-muted-foreground">{ticket.passengerEmail}</div>
										</TableCell>
										<TableCell>
											<div className="font-medium">{ticket.seatNumber}</div>
											<Badge variant="outline">{ticket.seatClass}</Badge>
										</TableCell>
										<TableCell>
											<Badge variant={
												ticket.bookingStatus === "confirmed" ? "default" :
												ticket.bookingStatus === "pending" ? "secondary" :
												"destructive"
											}>
												{ticket.bookingStatus}
											</Badge>
										</TableCell>
										<TableCell>
											{new Date(ticket.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" className="h-8 w-8 p-0">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuLabel>Actions</DropdownMenuLabel>
													<DropdownMenuItem onClick={() => handleViewTicket(ticket)}>
														<Eye className="h-4 w-4 mr-2" />
														View Details
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleEditTicket(ticket)}>
														<Edit className="h-4 w-4 mr-2" />
														Edit Ticket
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														onClick={() => {
															setSelectedTicket(ticket);
															setIsDeleteDialogOpen(true);
														}}
														className="text-destructive"
													>
														<Trash2 className="h-4 w-4 mr-2" />
														Delete Ticket
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* View Ticket Dialog */}
			<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Ticket Details</DialogTitle>
						<DialogDescription>
							Complete information for this ticket.
						</DialogDescription>
					</DialogHeader>
					{selectedTicket && (
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="font-semibold">Flight Information</Label>
									<p className="text-sm">{selectedTicket.flightNumber}</p>
									<p className="text-sm">{selectedTicket.airline}</p>
									<p className="text-sm">{selectedTicket.origin} → {selectedTicket.destination}</p>
									<p className="text-sm">{new Date(selectedTicket.date).toLocaleDateString()} at {selectedTicket.time}</p>
								</div>
								<div>
									<Label className="font-semibold">Passenger Information</Label>
									<p className="text-sm">{selectedTicket.passengerName}</p>
									<p className="text-sm">{selectedTicket.passengerEmail}</p>
									<p className="text-sm">{selectedTicket.passengerPhone}</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="font-semibold">Seat Information</Label>
									<p className="text-sm">Seat: {selectedTicket.seatNumber}</p>
									<p className="text-sm">Class: {selectedTicket.seatClass}</p>
									<p className="text-sm">Price: ${selectedTicket.seatPrice}</p>
								</div>
								<div>
									<Label className="font-semibold">Booking Information</Label>
									<p className="text-sm">Status: <Badge variant={
										selectedTicket.bookingStatus === "confirmed" ? "default" :
										selectedTicket.bookingStatus === "pending" ? "secondary" :
										"destructive"
									}>{selectedTicket.bookingStatus}</Badge></p>
									<p className="text-sm">Payment: <Badge variant={
										selectedTicket.paymentStatus === "paid" ? "default" : "secondary"
									}>{selectedTicket.paymentStatus}</Badge></p>
									{selectedTicket.amountPaid && (
										<p className="text-sm">Amount: ${selectedTicket.amountPaid}</p>
									)}
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Edit Ticket Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Ticket</DialogTitle>
						<DialogDescription>
							Update passenger and seat information for this ticket.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-name" className="text-right">Passenger Name</Label>
							<Input
								id="edit-name"
								value={editForm.passengerName}
								onChange={(e) => setEditForm({ ...editForm, passengerName: e.target.value })}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-email" className="text-right">Email</Label>
							<Input
								id="edit-email"
								type="email"
								value={editForm.passengerEmail}
								onChange={(e) => setEditForm({ ...editForm, passengerEmail: e.target.value })}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-phone" className="text-right">Phone</Label>
							<Input
								id="edit-phone"
								value={editForm.passengerPhone}
								onChange={(e) => setEditForm({ ...editForm, passengerPhone: e.target.value })}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="edit-seat" className="text-right">Seat Number</Label>
							<Input
								id="edit-seat"
								value={editForm.seatNumber}
								onChange={(e) => setEditForm({ ...editForm, seatNumber: e.target.value })}
								className="col-span-3"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={handleUpdateTicket}>Update Ticket</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Ticket Dialog */}
			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the ticket
							and remove all associated data from the system.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteTicket} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete Ticket
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
