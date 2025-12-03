"use client";

import {
	Facebook,
	Instagram,
	Mail,
	MapPin,
	Phone,
	Plane,
	Twitter,
} from "lucide-react";
import Link from "next/link";

const currentYear = new Date().getFullYear();
export function Footer() {
	return (
		<footer className="bg-card border-t">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Main Footer Content */}
				<div className="py-12">
					<div className="grid gap-8 lg:grid-cols-4">
						{/* Brand Section */}
						<div className="lg:col-span-1">
							<div className="flex items-center gap-2 mb-4">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
									<Plane className="h-4 w-4 text-primary-foreground" />
								</div>
								<span className="text-lg font-bold text-foreground">
									UniAir
								</span>
							</div>
							<p className="text-muted-foreground text-sm mb-4">
								Book your next adventure with confidence. University travel made
								easy.
							</p>
							<div className="flex gap-4">
								<a
									href="#"
									className="text-muted-foreground hover:text-primary transition-colors"
								>
									<Facebook className="h-5 w-5" />
								</a>
								<a
									href="#"
									className="text-muted-foreground hover:text-primary transition-colors"
								>
									<Twitter className="h-5 w-5" />
								</a>
								<a
									href="#"
									className="text-muted-foreground hover:text-primary transition-colors"
								>
									<Instagram className="h-5 w-5" />
								</a>
							</div>
						</div>

						{/* Quick Links */}
						<div>
							<h3 className="text-lg font-semibold text-foreground mb-4">
								Quick Links
							</h3>
							<ul className="space-y-2">
								<li>
									<Link
										href="/"
										className="text-muted-foreground hover:text-primary transition-colors text-sm"
									>
										Flight Search
									</Link>
								</li>
								<li>
									<Link
										href="/my-bookings"
										className="text-muted-foreground hover:text-primary transition-colors text-sm"
									>
										My Bookings
									</Link>
								</li>
								<li>
									<a
										href="#"
										className="text-muted-foreground hover:text-primary transition-colors text-sm"
									>
										Flight Status
									</a>
								</li>
								<li>
									<a
										href="#"
										className="text-muted-foreground hover:text-primary transition-colors text-sm"
									>
										Refund Policy
									</a>
								</li>
							</ul>
						</div>

						{/* Customer Support */}
						<div>
							<h3 className="text-lg font-semibold text-foreground mb-4">
								Support
							</h3>
							<ul className="space-y-2">
								<li className="flex items-center gap-2 text-muted-foreground text-sm">
									<Mail className="h-4 w-4" />
									support@uniair.com
								</li>
								<li className="flex items-center gap-2 text-muted-foreground text-sm">
									<Phone className="h-4 w-4" />
									+1 (555) 123-4567
								</li>
								<li className="flex items-center gap-2 text-muted-foreground text-sm">
									<MapPin className="h-4 w-4" />
									24/7 Support Available
								</li>
							</ul>
						</div>

						{/* Company */}
						<div>
							<h3 className="text-lg font-semibold text-foreground mb-4">
								Company
							</h3>
							<ul className="space-y-2">
								<li>
									<a
										href="#"
										className="text-muted-foreground hover:text-primary transition-colors text-sm"
									>
										About Us
									</a>
								</li>
								<li>
									<a
										href="#"
										className="text-muted-foreground hover:text-primary transition-colors text-sm"
									>
										Careers
									</a>
								</li>
								<li>
									<a
										href="#"
										className="text-muted-foreground hover:text-primary transition-colors text-sm"
									>
										Privacy Policy
									</a>
								</li>
								<li>
									<a
										href="#"
										className="text-muted-foreground hover:text-primary transition-colors text-sm"
									>
										Terms of Service
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="py-6 border-t border-muted">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<p className="text-muted-foreground text-sm">
							© {currentYear} UniAir. All rights reserved.
						</p>
						<p className="text-muted-foreground text-sm">
							Made with ❤️ for student travelers
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
