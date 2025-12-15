"use client";

import { Button } from "@/core/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { authClient } from "@/core/lib/auth/client";
import { cn } from "@/core/utils";
import { ChevronDown, LogOut, Menu, Plane, Shield, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const isAuthenticated = !!session;
	const user = session?.user;
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const handleLogout = async () => {
		await authClient.signOut();
		router.push("/auth/signin");
	};

	const isAdmin = user?.role === "admin";

	const navLinks = isAuthenticated
		? [
				{ href: "/", label: "Home" },
				{ href: "/my-bookings", label: "My Bookings" },
			]
		: [];

	const adminLinks = isAdmin
		? [
				{ href: "/admin", label: "Dashboard" },
				{ href: "/admin/bookings", label: "Bookings" },
				{ href: "/admin/users", label: "Users" },
				{ href: "/admin/tickets", label: "Tickets" },
				{ href: "/admin/reports", label: "Reports" },
				{ href: "/admin/audit", label: "Audit Logs" },
			]
		: [];

	return (
		<nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<Link href="/" className="flex items-center gap-2">
						<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
							<Plane className="h-5 w-5 text-primary-foreground" />
						</div>
						<span className="text-xl font-bold text-foreground">UniAir</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-6">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={cn(
									"text-sm font-medium transition-colors hover:text-primary",
									pathname === link.href
										? "text-primary"
										: "text-muted-foreground",
								)}
							>
								{link.label}
							</Link>
						))}

						{/* Admin Dropdown */}
						{adminLinks.length > 0 && (
							<>
								<div className="h-4 w-px bg-border" />
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className={cn(
												"gap-1 text-sm font-medium",
												pathname.startsWith("/admin")
													? "text-primary"
													: "text-muted-foreground",
											)}
										>
											<Shield className="h-4 w-4" />
											Admin
											<ChevronDown className="h-3 w-3" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
										<DropdownMenuSeparator />
										{adminLinks.map((link) => (
											<DropdownMenuItem key={link.href} asChild>
												<Link
													href={link.href}
													className={cn(
														"cursor-pointer",
														pathname === link.href && "bg-accent",
													)}
												>
													{link.label}
												</Link>
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</>
						)}

						{isAuthenticated ? (
							<div className="flex items-center gap-4">
								<span className="text-sm text-muted-foreground">
									{user?.email}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={handleLogout}
									className="gap-2 bg-transparent"
								>
									<LogOut className="h-4 w-4" />
									Logout
								</Button>
							</div>
						) : (
							<Link href="/auth/signin">
								<Button size="sm">Login</Button>
							</Link>
						)}
					</div>

					{/* Mobile menu button */}
					<button
						className="md:hidden p-2"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label="Toggle menu"
					>
						{mobileMenuOpen ? (
							<X className="h-6 w-6" />
						) : (
							<Menu className="h-6 w-6" />
						)}
					</button>
				</div>

				{/* Mobile Navigation */}
				{mobileMenuOpen && (
					<div className="md:hidden border-t py-4 space-y-4">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={cn(
									"block text-sm font-medium transition-colors hover:text-primary py-2",
									pathname === link.href
										? "text-primary"
										: "text-muted-foreground",
								)}
								onClick={() => setMobileMenuOpen(false)}
							>
								{link.label}
							</Link>
						))}

						{/* Admin Links */}
						{adminLinks.length > 0 && (
							<>
								<div className="border-t pt-4">
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
										Admin
									</p>
									{adminLinks.map((link) => (
										<Link
											key={link.href}
											href={link.href}
											className={cn(
												"block text-sm font-medium transition-colors hover:text-primary py-2",
												pathname === link.href
													? "text-primary"
													: "text-muted-foreground",
											)}
											onClick={() => setMobileMenuOpen(false)}
										>
											{link.label}
										</Link>
									))}
								</div>
							</>
						)}

						{isAuthenticated ? (
							<div className="space-y-3 pt-2 border-t">
								<p className="text-sm text-muted-foreground">{user?.email}</p>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										handleLogout();
										setMobileMenuOpen(false);
									}}
									className="w-full gap-2"
								>
									<LogOut className="h-4 w-4" />
									Logout
								</Button>
							</div>
						) : (
							<Link
								href="/auth/signin"
								onClick={() => setMobileMenuOpen(false)}
							>
								<Button size="sm" className="w-full">
									Login
								</Button>
							</Link>
						)}
					</div>
				)}
			</div>
		</nav>
	);
}
