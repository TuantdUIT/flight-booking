"use client";

import { Button } from "@/core/components/ui/button";
import { Calendar } from "@/core/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Label } from "@/core/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import dayjs from "dayjs";
import { CalendarIcon, DollarSign, Download, Plane, RefreshCw, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

interface RevenueData {
	summary: {
		totalRevenue: number;
		totalBookings: number;
		confirmedBookings: number;
		cancelledBookings: number;
		pendingBookings: number;
		confirmationRate: number;
	};
	monthlyRevenue: Array<{
		month: string;
		revenue: number;
		bookings: number;
	}>;
	airlineRevenue: Array<{
		airlineId: number;
		airlineName: string;
		revenue: number;
		bookings: number;
	}>;
	routeRevenue: Array<{
		route: string;
		revenue: number;
		bookings: number;
	}>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function RevenueReportsPage() {
	const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
	const [loading, setLoading] = useState(true);
	const [fromDate, setFromDate] = useState<Date>();
	const [toDate, setToDate] = useState<Date>();
	const [isFromCalendarOpen, setIsFromCalendarOpen] = useState(false);
	const [isToCalendarOpen, setIsToCalendarOpen] = useState(false);

	useEffect(() => {
		loadRevenueData();
	}, []);

	const loadRevenueData = async () => {
		try {
			setLoading(true);
			let url = "/api/reports/revenue";

			const params = new URLSearchParams();
			if (fromDate) {
				params.append("fromDate", fromDate.toISOString());
			}
			if (toDate) {
				params.append("toDate", toDate.toISOString());
			}

			if (params.toString()) {
				url += `?${params.toString()}`;
			}

			const response = await fetch(url);
			if (response.ok) {
				const data = await response.json();
				setRevenueData(data);
			} else {
				throw new Error("Failed to load revenue data");
			}
		} catch (error) {
			toast.error("Failed to load revenue reports");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleExportReport = () => {
		// In a real implementation, this would generate and download a PDF/Excel report
		toast.info("Export functionality would be implemented here");
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<RefreshCw className="h-8 w-8 animate-spin mr-2" />
				Loading revenue reports...
			</div>
		);
	}

	if (!revenueData) {
		return (
			<div className="flex justify-center items-center h-64">
				<p className="text-muted-foreground">Failed to load revenue data</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold">Revenue Reports</h1>
					<p className="text-muted-foreground mt-2">
						View detailed revenue statistics and booking analytics.
					</p>
				</div>
				<Button onClick={handleExportReport}>
					<Download className="h-4 w-4 mr-2" />
					Export Report
				</Button>
			</div>

			{/* Filters */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Report Filters</CardTitle>
					<CardDescription>
						Filter revenue data by date range.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4 items-end">
						<div className="grid gap-2">
							<Label>From Date</Label>
							<Popover open={isFromCalendarOpen} onOpenChange={setIsFromCalendarOpen}>
								<PopoverTrigger asChild>
									<Button variant="outline" className="w-48 justify-start text-left font-normal">
										<CalendarIcon className="mr-2 h-4 w-4" />
										{fromDate ? dayjs(fromDate).format("MMM DD, YYYY") : "Pick a date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={fromDate}
										onSelect={(date) => {
											setFromDate(date);
											setIsFromCalendarOpen(false);
										}}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div className="grid gap-2">
							<Label>To Date</Label>
							<Popover open={isToCalendarOpen} onOpenChange={setIsToCalendarOpen}>
								<PopoverTrigger asChild>
									<Button variant="outline" className="w-48 justify-start text-left font-normal">
										<CalendarIcon className="mr-2 h-4 w-4" />
										{toDate ? dayjs(toDate).format("MMM DD, YYYY") : "Pick a date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={toDate}
										onSelect={(date) => {
											setToDate(date);
											setIsToCalendarOpen(false);
										}}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						<Button onClick={loadRevenueData}>
							<RefreshCw className="h-4 w-4 mr-2" />
							Apply Filters
						</Button>

						<Button
							variant="outline"
							onClick={() => {
								setFromDate(undefined);
								setToDate(undefined);
								loadRevenueData();
							}}
						>
							Clear Filters
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatCurrency(revenueData.summary.totalRevenue)}</div>
						<p className="text-xs text-muted-foreground">
							From {revenueData.summary.totalBookings} total bookings
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{revenueData.summary.confirmedBookings}</div>
						<p className="text-xs text-muted-foreground">
							{revenueData.summary.confirmationRate}% confirmation rate
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
						<Plane className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{revenueData.summary.pendingBookings}</div>
						<p className="text-xs text-muted-foreground">
							Awaiting confirmation
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Cancelled Bookings</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{revenueData.summary.cancelledBookings}</div>
						<p className="text-xs text-muted-foreground">
							Requires attention
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
					<TabsTrigger value="airlines">By Airline</TabsTrigger>
					<TabsTrigger value="routes">By Route</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Revenue Breakdown</CardTitle>
								<CardDescription>
									Distribution of confirmed vs pending revenue
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={300}>
									<PieChart>
										<Pie
											data={[
												{ name: 'Confirmed Revenue', value: revenueData.summary.totalRevenue, fill: '#00C49F' },
												{ name: 'Pending Revenue', value: 0, fill: '#FFBB28' }, // Would need actual pending revenue calculation
											]}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
											outerRadius={80}
											fill="#8884d8"
											dataKey="value"
										>
											{[
												{ name: 'Confirmed Revenue', value: revenueData.summary.totalRevenue, fill: '#00C49F' },
												{ name: 'Pending Revenue', value: 0, fill: '#FFBB28' },
											].map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.fill} />
											))}
										</Pie>
										<Tooltip formatter={(value) => formatCurrency(Number(value))} />
									</PieChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Booking Status Distribution</CardTitle>
								<CardDescription>
									Current status of all bookings
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={300}>
									<PieChart>
										<Pie
											data={[
												{ name: 'Confirmed', value: revenueData.summary.confirmedBookings, fill: '#00C49F' },
												{ name: 'Pending', value: revenueData.summary.pendingBookings, fill: '#FFBB28' },
												{ name: 'Cancelled', value: revenueData.summary.cancelledBookings, fill: '#FF8042' },
											]}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
											outerRadius={80}
											fill="#8884d8"
											dataKey="value"
										>
											{[
												{ name: 'Confirmed', value: revenueData.summary.confirmedBookings, fill: '#00C49F' },
												{ name: 'Pending', value: revenueData.summary.pendingBookings, fill: '#FFBB28' },
												{ name: 'Cancelled', value: revenueData.summary.cancelledBookings, fill: '#FF8042' },
											].map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.fill} />
											))}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="monthly" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Monthly Revenue Trends</CardTitle>
							<CardDescription>
								Revenue and booking volume over the last 12 months
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={400}>
								<BarChart data={revenueData.monthlyRevenue}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="month" />
									<YAxis yAxisId="left" orientation="left" />
									<YAxis yAxisId="right" orientation="right" />
									<Tooltip
										formatter={(value, name) => [
											name === 'revenue' ? formatCurrency(Number(value)) : value,
											name === 'revenue' ? 'Revenue' : 'Bookings'
										]}
									/>
									<Bar yAxisId="left" dataKey="revenue" fill="#0088FE" name="revenue" />
									<Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#FF8042" strokeWidth={2} />
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Monthly Data Table</CardTitle>
							<CardDescription>
								Detailed monthly revenue and booking statistics
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Month</TableHead>
										<TableHead>Revenue</TableHead>
										<TableHead>Bookings</TableHead>
										<TableHead>Average per Booking</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{revenueData.monthlyRevenue.map((item) => (
										<TableRow key={item.month}>
											<TableCell>{item.month}</TableCell>
											<TableCell>{formatCurrency(item.revenue)}</TableCell>
											<TableCell>{item.bookings}</TableCell>
											<TableCell>
												{item.bookings > 0 ? formatCurrency(item.revenue / item.bookings) : '$0.00'}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="airlines" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Revenue by Airline</CardTitle>
							<CardDescription>
								Revenue distribution across different airlines
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={400}>
								<BarChart data={revenueData.airlineRevenue} layout="horizontal">
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis type="number" />
									<YAxis dataKey="airlineName" type="category" width={100} />
									<Tooltip formatter={(value) => formatCurrency(Number(value))} />
									<Bar dataKey="revenue" fill="#00C49F" />
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Airline Performance Table</CardTitle>
							<CardDescription>
								Detailed airline revenue and booking statistics
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Airline</TableHead>
										<TableHead>Revenue</TableHead>
										<TableHead>Bookings</TableHead>
										<TableHead>Average per Booking</TableHead>
										<TableHead>Market Share</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{revenueData.airlineRevenue.map((item) => {
										const totalBookings = revenueData.airlineRevenue.reduce((sum, airline) => sum + airline.bookings, 0);
										const marketShare = totalBookings > 0 ? ((item.bookings / totalBookings) * 100).toFixed(1) : '0.0';

										return (
											<TableRow key={item.airlineId}>
												<TableCell>{item.airlineName}</TableCell>
												<TableCell>{formatCurrency(item.revenue)}</TableCell>
												<TableCell>{item.bookings}</TableCell>
												<TableCell>
													{item.bookings > 0 ? formatCurrency(item.revenue / item.bookings) : '$0.00'}
												</TableCell>
												<TableCell>{marketShare}%</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="routes" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Revenue by Route</CardTitle>
							<CardDescription>
								Most profitable flight routes
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={400}>
								<BarChart data={revenueData.routeRevenue}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="route" angle={-45} textAnchor="end" height={80} />
									<YAxis />
									<Tooltip formatter={(value) => formatCurrency(Number(value))} />
									<Bar dataKey="revenue" fill="#FF8042" />
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Route Performance Table</CardTitle>
							<CardDescription>
								Detailed route revenue and booking statistics
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Route</TableHead>
										<TableHead>Revenue</TableHead>
										<TableHead>Bookings</TableHead>
										<TableHead>Average per Booking</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{revenueData.routeRevenue.map((item, index) => (
										<TableRow key={index}>
											<TableCell>{item.route}</TableCell>
											<TableCell>{formatCurrency(item.revenue)}</TableCell>
											<TableCell>{item.bookings}</TableCell>
											<TableCell>
												{item.bookings > 0 ? formatCurrency(item.revenue / item.bookings) : '$0.00'}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
