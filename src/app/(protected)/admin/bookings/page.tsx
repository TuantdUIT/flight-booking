"use client";

import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/core/components/ui/dropdown-menu";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { CheckCircle, Clock, Eye, History, MoreHorizontal, Search, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Booking {
	id: number;
	pnr: string;
	bookingStatus: string;
	paymentStatus: string;
	amountPaid: string | null;
	userId: string;
	flightId: number;
	airlineId: number;
	createdAt: Date;
	updatedAt: Date;
	// Additional data from joins
	userEmail?: string;
	userName?: string;
	flightNumber?: string;
	airlineName?: string;
	origin?: string;
	destination?: string;
	flightDate?: Date;
	passengerCount?: number;
}

interface BookingHistory {
	id: number;
	bookingId: number;
	action: string;
	oldStatus: string;
	newStatus: string;
	adminId: string;
	adminName: string;
	createdAt: Date;
	reason?: string;
}

export default function BookingManagementPage() {
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
	const [selectedHistory, setSelectedHistory] = useState<BookingHistory[]>([]);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
	const [newStatus, setNewStatus] = useState("");
	const [updateReason, setUpdateReason] = useState("");

	useEffect(() => {
		loadBookings();
	}, []);

	const loadBookings = async () => {
		try {
			const response = await fetch("/api/admin/bookings");
			if (response.ok) {
				const data = await response.json();
				setBookings(data.bookings || []);
			} else {
				// Fallback to regular bookings API
				const response = await fetch("/api/bookings");
				if (response.ok) {
					const data = await response.json();
					setBookings([]);
				}
			}
		} catch (error) {
			toast.error("Failed to load bookings");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = async () => {
		if (!searchTerm.trim()) {
			loadBookings();
			return;
		}

		try {
			const response = await fetch(`/api/bookings?search=${encodeURIComponent(searchTerm)}`);
			if (response.ok) {
				const data = await response.json();
				setBookings([]);
			}
		} catch (error) {
			toast.error("Search failed");
			console.error(error);
		}
	};

	const handleUpdateStatus = async (bookingId: number, status: string) => {
		try {
			const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					status,
					reason: updateReason || "Status updated by admin"
				}),
			});

			if (response.ok) {
				toast.success(`Booking status updated to ${status}`);
				setIsUpdateDialogOpen(false);
				setUpdateReason("");
				loadBookings();
			} else {
				throw new Error("Update failed");
			}
		} catch (error) {
			toast.error("Failed to update booking status");
			console.error(error);
		}
	};

	const handleViewBooking = (booking: Booking) => {
		setSelectedBooking(booking);
		setIsViewDialogOpen(true);
	};

	const handleViewHistory = async (bookingId: number) => {
		try {
			const response = await fetch(`/api/admin/bookings/${bookingId}/history`);
			if (response.ok) {
				const data = await response.json();
				setSelectedHistory(data.history || []);
				setIsHistoryDialogOpen(true);
			} else {
				toast.error("Failed to load booking history");
			}
		} catch (error) {
			toast.error("Failed to load booking history");
			console.error(error);
		}
	};

	const openUpdateDialog = (booking: Booking) => {
		setSelectedBooking(booking);
		setNewStatus(booking.bookingStatus);
		setIsUpdateDialogOpen(true);
	};

	const filteredBookings = bookings.filter(booking => {
		const matchesSearch = !searchTerm ||
			booking.pnr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus = statusFilter === "all" || booking.bookingStatus === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "confirmed": return "default";
			case "pending": return "secondary";
			case "failed": return "destructive";
			default: return "outline";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "confirmed": return <CheckCircle className="h-4 w-4" />;
			case "pending": return <Clock className="h-4 w-4" />;
			case "failed": return <XCircle className="h-4 w-4" />;
			default: return null;
		}
	};

	if (loading) {
		return <div className="flex justify-center items-center h-64">Loading...</div>;
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold">Booking Management</h1>
					<p className="text-muted-foreground mt-2">
						Process booking statuses and view booking processing history.
					</p>
				</div>
			</div>

			<Tabs defaultValue="bookings" className="space-y-6">
				<TabsList>
					<TabsTrigger value="bookings">Active Bookings</TabsTrigger>
					<TabsTrigger value="history">Processing History</TabsTrigger>
				</TabsList>

				<TabsContent value="bookings" className="space-y-6">
					{/* Filters */}
					<div className="flex gap-4 mb-6">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by PNR or user email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
								onKeyPress={(e) => e.key === "Enter" && handleSearch()}
							/>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="confirmed">Confirmed</SelectItem>
								<SelectItem value="failed">Failed</SelectItem>
							</SelectContent>
						</Select>
						<Button onClick={handleSearch}>
							<Search className="h-4 w-4 mr-2" />
							Search
						</Button>
					</div>

					{/* Bookings Table */}
					<Card>
						<CardHeader>
							<CardTitle>Bookings ({filteredBookings.length})</CardTitle>
							<CardDescription>
								Manage booking statuses and process customer bookings.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>PNR</TableHead>
										<TableHead>User</TableHead>
										<TableHead>Flight</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Payment</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredBookings.length === 0 ? (
										<TableRow>
											<TableCell colSpan={8} className="text-center py-8">
												No bookings found matching your criteria.
											</TableCell>
										</TableRow>
									) : (
										filteredBookings.map((booking) => (
											<TableRow key={booking.id}>
												<TableCell className="font-medium">
													{booking.pnr || `BK${booking.id.toString().padStart(6, '0')}`}
												</TableCell>
												<TableCell>
													<div className="font-medium">{booking.userName || "Unknown"}</div>
													<div className="text-sm text-muted-foreground">{booking.userEmail}</div>
												</TableCell>
												<TableCell>
													<div className="font-medium">{booking.flightNumber || `Flight ${booking.flightId}`}</div>
													<div className="text-sm text-muted-foreground">
														{booking.origin} → {booking.destination}
													</div>
												</TableCell>
												<TableCell>
													<Badge variant={getStatusColor(booking.bookingStatus)}>
														{getStatusIcon(booking.bookingStatus)}
														<span className="ml-1">{booking.bookingStatus}</span>
													</Badge>
												</TableCell>
												<TableCell>
													<Badge variant={booking.paymentStatus === "paid" ? "default" : "secondary"}>
														{booking.paymentStatus}
													</Badge>
												</TableCell>
												<TableCell>
													{booking.amountPaid ? `$${booking.amountPaid}` : "N/A"}
												</TableCell>
												<TableCell>
													{new Date(booking.createdAt).toLocaleDateString()}
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
															<DropdownMenuItem onClick={() => handleViewBooking(booking)}>
																<Eye className="h-4 w-4 mr-2" />
																View Details
															</DropdownMenuItem>
															<DropdownMenuItem onClick={() => openUpdateDialog(booking)}>
																<CheckCircle className="h-4 w-4 mr-2" />
																Update Status
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem onClick={() => handleViewHistory(booking.id)}>
																<History className="h-4 w-4 mr-2" />
																View History
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
				</TabsContent>

				<TabsContent value="history" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Recent Booking Activities</CardTitle>
							<CardDescription>
								View the processing history of booking status changes.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-center py-8 text-muted-foreground">
								<History className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>Select a booking from the Active Bookings tab to view its processing history.</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* View Booking Dialog */}
			<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Booking Details</DialogTitle>
						<DialogDescription>
							Complete information for booking {selectedBooking?.pnr}
						</DialogDescription>
					</DialogHeader>
					{selectedBooking && (
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="font-semibold">Booking Information</Label>
									<p className="text-sm">PNR: {selectedBooking.pnr}</p>
									<p className="text-sm">Status: <Badge variant={getStatusColor(selectedBooking.bookingStatus)}>
										{selectedBooking.bookingStatus}
									</Badge></p>
									<p className="text-sm">Payment: <Badge variant={selectedBooking.paymentStatus === "paid" ? "default" : "secondary"}>
										{selectedBooking.paymentStatus}
									</Badge></p>
									{selectedBooking.amountPaid && (
										<p className="text-sm">Amount: ${selectedBooking.amountPaid}</p>
									)}
								</div>
								<div>
									<Label className="font-semibold">Customer Information</Label>
									<p className="text-sm">{selectedBooking.userName}</p>
									<p className="text-sm">{selectedBooking.userEmail}</p>
								</div>
							</div>
							<div>
								<Label className="font-semibold">Flight Information</Label>
								<p className="text-sm">{selectedBooking.flightNumber}</p>
								<p className="text-sm">{selectedBooking.airlineName}</p>
								<p className="text-sm">Route: {selectedBooking.origin} → {selectedBooking.destination}</p>
								<p className="text-sm">Date: {selectedBooking.flightDate ? new Date(selectedBooking.flightDate).toLocaleDateString() : "N/A"}</p>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Update Status Dialog */}
			<Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Update Booking Status</DialogTitle>
						<DialogDescription>
							Change the status of booking {selectedBooking?.pnr}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="status" className="text-right">New Status</Label>
							<Select value={newStatus} onValueChange={setNewStatus}>
								<SelectTrigger className="col-span-3">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="confirmed">Confirmed</SelectItem>
									<SelectItem value="failed">Failed</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="reason" className="text-right">Reason</Label>
							<Input
								id="reason"
								value={updateReason}
								onChange={(e) => setUpdateReason(e.target.value)}
								placeholder="Optional reason for status change"
								className="col-span-3"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={() => selectedBooking && handleUpdateStatus(selectedBooking.id, newStatus)}>
							Update Status
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* History Dialog */}
			<Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>Booking Processing History</DialogTitle>
						<DialogDescription>
							Complete history of status changes for this booking.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Action</TableHead>
									<TableHead>Status Change</TableHead>
									<TableHead>Admin</TableHead>
									<TableHead>Reason</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{selectedHistory.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="text-center py-4">
											No history records found for this booking.
										</TableCell>
									</TableRow>
								) : (
									selectedHistory.map((history) => (
										<TableRow key={history.id}>
											<TableCell>
												{new Date(history.createdAt).toLocaleString()}
											</TableCell>
											<TableCell>{history.action}</TableCell>
											<TableCell>
												{history.oldStatus} → {history.newStatus}
											</TableCell>
											<TableCell>{history.adminName}</TableCell>
											<TableCell>{history.reason || "N/A"}</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
