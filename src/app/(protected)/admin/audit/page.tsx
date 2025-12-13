"use client";

import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/core/components/ui/table";
import { Eye, RefreshCw, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuditLog {
	id: number;
	userId: string | null;
	action: string;
	entityType: string;
	entityId: string | null;
	details: string | null;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: string;
}

interface AuditFilters {
	userId?: string;
	action?: string;
	entityType?: string;
	entityId?: string;
	limit?: number;
	offset?: number;
}

export default function AuditLogsPage() {
	const router = useRouter();
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<AuditFilters>({
		limit: 50,
		offset: 0,
	});

	// Check admin permission
	useEffect(() => {
		const checkAdmin = async () => {
			try {
				const response = await fetch("/api/audit");
				if (response.status === 403) {
					router.push("/");
					return;
				}
			} catch (err) {
				console.error("Failed to check admin permission:", err);
				router.push("/");
			}
		};

		checkAdmin();
	}, [router]);

	const fetchLogs = async () => {
		setLoading(true);
		setError(null);

		try {
			const queryParams = new URLSearchParams();
			if (filters.userId) queryParams.set("userId", filters.userId);
			if (filters.action) queryParams.set("action", filters.action);
			if (filters.entityType) queryParams.set("entityType", filters.entityType);
			if (filters.entityId) queryParams.set("entityId", filters.entityId);
			if (filters.limit) queryParams.set("limit", filters.limit.toString());
			if (filters.offset) queryParams.set("offset", filters.offset.toString());

			const response = await fetch(`/api/audit?${queryParams}`);
			if (!response.ok) {
				throw new Error("Failed to fetch audit logs");
			}

			const data = await response.json();
			if (data.success) {
				setLogs(data.data);
			} else {
				setError(data.error?.message || "Failed to fetch logs");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLogs();
	}, [filters]);

	const handleFilterChange = (key: keyof AuditFilters, value: string | number) => {
		setFilters(prev => ({
			...prev,
			[key]: value || undefined,
			offset: 0, // Reset pagination when filters change
		}));
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	const getActionBadgeVariant = (action: string) => {
		switch (action.toLowerCase()) {
			case "create":
			case "login":
				return "default";
			case "update":
				return "secondary";
			case "delete":
				return "destructive";
			default:
				return "outline";
		}
	};

	if (loading && logs.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<div className="text-center">
					<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
					<p className="text-muted-foreground">Loading audit logs...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-background">
			<div className="py-8 lg:py-12">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
						<p className="mt-2 text-muted-foreground">
							View and monitor system activities and user actions
						</p>
					</div>

					{/* Filters */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle className="text-lg">Filters</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
								<div>
									<label className="text-sm font-medium mb-1 block">User ID</label>
									<Input
										placeholder="Filter by user ID"
										value={filters.userId || ""}
										onChange={(e) => handleFilterChange("userId", e.target.value)}
									/>
								</div>
								<div>
									<label className="text-sm font-medium mb-1 block">Action</label>
									<Select
										value={filters.action || ""}
										onValueChange={(value) => handleFilterChange("action", value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="All actions" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">All actions</SelectItem>
											<SelectItem value="CREATE">Create</SelectItem>
											<SelectItem value="UPDATE">Update</SelectItem>
											<SelectItem value="DELETE">Delete</SelectItem>
											<SelectItem value="LOGIN">Login</SelectItem>
											<SelectItem value="LOGOUT">Logout</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<label className="text-sm font-medium mb-1 block">Entity Type</label>
									<Select
										value={filters.entityType || ""}
										onValueChange={(value) => handleFilterChange("entityType", value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="All entity types" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">All entity types</SelectItem>
											<SelectItem value="booking">Booking</SelectItem>
											<SelectItem value="flight">Flight</SelectItem>
											<SelectItem value="user">User</SelectItem>
											<SelectItem value="airline">Airline</SelectItem>
											<SelectItem value="passenger">Passenger</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<label className="text-sm font-medium mb-1 block">Entity ID</label>
									<Input
										placeholder="Filter by entity ID"
										value={filters.entityId || ""}
										onChange={(e) => handleFilterChange("entityId", e.target.value)}
									/>
								</div>
							</div>
							<div className="flex gap-2 mt-4">
								<Button onClick={fetchLogs} variant="outline">
									<Search className="h-4 w-4 mr-2" />
									Search
								</Button>
								<Button
									onClick={() => setFilters({ limit: 50, offset: 0 })}
									variant="outline"
								>
									<RefreshCw className="h-4 w-4 mr-2" />
									Clear Filters
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Error State */}
					{error && (
						<Card className="mb-6 border-destructive">
							<CardContent className="pt-6">
								<p className="text-destructive">{error}</p>
								<Button onClick={fetchLogs} className="mt-2" variant="outline">
									<RefreshCw className="h-4 w-4 mr-2" />
									Retry
								</Button>
							</CardContent>
						</Card>
					)}

					{/* Logs Table */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Audit Logs ({logs.length})</CardTitle>
						</CardHeader>
						<CardContent>
							{logs.length === 0 ? (
								<div className="text-center py-8">
									<Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<p className="text-muted-foreground">No audit logs found</p>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Timestamp</TableHead>
											<TableHead>User ID</TableHead>
											<TableHead>Action</TableHead>
											<TableHead>Entity Type</TableHead>
											<TableHead>Entity ID</TableHead>
											<TableHead>IP Address</TableHead>
											<TableHead>Details</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{logs.map((log) => (
											<TableRow key={log.id}>
												<TableCell className="font-mono text-sm">
													{formatDate(log.createdAt)}
												</TableCell>
												<TableCell>
													{log.userId ? (
														<span className="font-mono text-sm">{log.userId}</span>
													) : (
														<span className="text-muted-foreground">-</span>
													)}
												</TableCell>
												<TableCell>
													<Badge variant={getActionBadgeVariant(log.action)}>
														{log.action}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge variant="outline">{log.entityType}</Badge>
												</TableCell>
												<TableCell>
													{log.entityId ? (
														<span className="font-mono text-sm">{log.entityId}</span>
													) : (
														<span className="text-muted-foreground">-</span>
													)}
												</TableCell>
												<TableCell>
													{log.ipAddress ? (
														<span className="font-mono text-sm">{log.ipAddress}</span>
													) : (
														<span className="text-muted-foreground">-</span>
													)}
												</TableCell>
												<TableCell className="max-w-xs">
													{log.details ? (
														<div
															className="text-sm text-muted-foreground truncate"
															title={log.details}
														>
															{log.details.length > 50
																? `${log.details.substring(0, 50)}...`
																: log.details
															}
														</div>
													) : (
														<span className="text-muted-foreground">-</span>
													)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}

							{/* Pagination */}
							{logs.length >= (filters.limit || 50) && (
								<div className="flex justify-between items-center mt-4">
									<Button
										variant="outline"
										disabled={(filters.offset || 0) === 0}
										onClick={() => handleFilterChange("offset", Math.max(0, (filters.offset || 0) - (filters.limit || 50)))}
									>
										Previous
									</Button>
									<span className="text-sm text-muted-foreground">
										Page {Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1}
									</span>
									<Button
										variant="outline"
										disabled={logs.length < (filters.limit || 50)}
										onClick={() => handleFilterChange("offset", (filters.offset || 0) + (filters.limit || 50))}
									>
										Next
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
