"use client";

import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Activity, BarChart3, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
	return (
		<div className="container mx-auto py-8 px-4">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground mt-2">
					Manage users, view audit logs, and monitor system activity.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">User Management</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<CardDescription className="text-xs mb-4">
							Create, update, ban, and manage user accounts
						</CardDescription>
						<Link href="/admin/users">
							<Button size="sm" className="w-full">
								Manage Users
							</Button>
						</Link>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Ticket Management</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<CardDescription className="text-xs mb-4">
							Add, edit, delete and search tickets
						</CardDescription>
						<Link href="/admin/tickets">
							<Button size="sm" className="w-full">
								Manage Tickets
							</Button>
						</Link>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Booking Management</CardTitle>
						<Shield className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<CardDescription className="text-xs mb-4">
							Process bookings and view booking history
						</CardDescription>
						<Link href="/admin/bookings">
							<Button size="sm" className="w-full">
								Manage Bookings
							</Button>
						</Link>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<CardDescription className="text-xs mb-4">
							View system activity and user actions
						</CardDescription>
						<Link href="/admin/audit">
							<Button size="sm" className="w-full">
								View Logs
							</Button>
						</Link>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Revenue Reports</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<CardDescription className="text-xs mb-4">
							View revenue and booking statistics
						</CardDescription>
						<Link href="/admin/reports">
							<Button size="sm" className="w-full">
								View Reports
							</Button>
						</Link>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">System Status</CardTitle>
						<Shield className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<CardDescription className="text-xs mb-4">
							Monitor system health and performance
						</CardDescription>
						<Badge variant="secondary" className="text-xs">
							All Systems Operational
						</Badge>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
