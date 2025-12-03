"use client";

import { Button } from "@/core/components/ui/button";
import { MapPin, Plane } from "lucide-react";

interface LandingProps {
	hasSearched: boolean;
}

export function Landing({ hasSearched }: LandingProps) {
	if (hasSearched) return null;

	return (
		<>
			{/* Features Section */}
			<div className="py-16">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-foreground mb-4">
							Why Choose UniAir?
						</h2>
						<p className="text-lg text-muted-foreground">
							Your trusted partner for comfortable and reliable air travel
						</p>
					</div>
					<div className="grid gap-8 md:grid-cols-3">
						{[
							{
								title: "Best Prices",
								description:
									"Compare prices across multiple airlines to find the best deals",
								icon: "💰",
							},
							{
								title: "Easy Booking",
								description:
									"Simple and fast booking process in just a few clicks",
								icon: "⚡",
							},
							{
								title: "24/7 Support",
								description: "Our support team is always here to help you",
								icon: "🛟",
							},
							{
								title: "Priority Boarding",
								description:
									"Premium services for a comfortable travel experience",
								icon: "✈️",
							},
							{
								title: "Secure Payments",
								description: "Bank-grade security for all your transactions",
								icon: "🔒",
							},
							{
								title: "Travel Insurance",
								description: "Comprehensive coverage for peace of mind",
								icon: "️",
							},
						].map((feature) => (
							<div
								key={feature.title}
								className="rounded-xl border bg-card p-6 text-center hover:shadow-lg transition-shadow"
							>
								<div className="text-4xl mb-4">{feature.icon}</div>
								<h3 className="text-lg font-semibold text-foreground">
									{feature.title}
								</h3>
								<p className="mt-2 text-muted-foreground text-sm">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Popular Routes */}
			<div className="py-16 bg-muted/30">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-foreground mb-4">
							Popular Routes
						</h2>
						<p className="text-lg text-muted-foreground">
							Trending destinations for global travelers
						</p>
					</div>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{[
							{ from: "New York JFK", to: "London Heathrow", price: "$349" },
							{ from: "Los Angeles LAX", to: "Tokyo Haneda", price: "$599" },
							{
								from: "Toronto Pearson",
								to: "Sydney Kingsford",
								price: "$799",
							},
							{ from: "Paris CDG", to: "Boston Logan", price: "$299" },
						].map((route, index) => (
							<div
								key={index}
								className="rounded-xl border bg-card p-4 text-center hover:shadow-md transition-shadow"
							>
								<div className="flex items-center justify-center gap-2 mb-2">
									<MapPin className="h-4 w-4 text-primary" />
									<span className="text-sm font-medium text-foreground">
										{route.from}
									</span>
									<Plane className="h-4 w-4 text-primary rotate-90" />
									<span className="text-sm font-medium text-foreground">
										{route.to}
									</span>
								</div>
								<p className="text-lg font-bold text-primary mb-2">
									from {route.price}
								</p>
								<Button
									size="sm"
									variant="outline"
									onClick={() =>
										alert("Route selected - implement navigation to search")
									}
									className="w-full"
								>
									Book Now
								</Button>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Statistics Section */}
			<div className="py-16">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
						{[
							{ number: "50K+", label: "Flights Booked" },
							{ number: "25K+", label: "Happy Travelers" },
							{ number: "50+", label: "Partner Airlines" },
							{ number: "4.8/5", label: "Average Rating" },
						].map((stat, index) => (
							<div key={index} className="text-center">
								<p className="text-4xl font-bold text-primary mb-2">
									{stat.number}
								</p>
								<p className="text-muted-foreground text-sm">{stat.label}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Testimonials */}
			<div className="py-16 bg-muted/30">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-foreground mb-4">
							What Our Travelers Say
						</h2>
						<p className="text-lg text-muted-foreground">
							Real experiences from satisfied customers worldwide
						</p>
					</div>
					<div className="grid gap-8 md:grid-cols-3">
						{[
							{
								quote:
									"Excellent service and great prices. Booking was smooth and the support team was very helpful!",
								author: "Sarah Chen",
								position: "Frequent Traveler",
								rating: 5,
							},
							{
								quote:
									"Found amazing deals on my business trip. Highly recommend UniAir for international flights!",
								author: "Michael Rodriguez",
								position: "Business Consultant",
								rating: 5,
							},
							{
								quote:
									"The customer service is outstanding. They helped me reschedule my flight with no hassle.",
								author: "Emma Thompson",
								position: "Digital Nomad",
								rating: 5,
							},
						].map((testimonial, index) => (
							<div key={index} className="rounded-xl border bg-card p-6">
								<div className="flex mb-4">
									{Array.from({ length: testimonial.rating }).map((_, i) => (
										<span key={i} className="text-yellow-400">
											★
										</span>
									))}
								</div>
								<p className="text-muted-foreground mb-4 italic">
									"{testimonial.quote}"
								</p>
								<div>
									<p className="font-semibold text-foreground">
										{testimonial.author}
									</p>
									<p className="text-sm text-muted-foreground">
										{testimonial.position}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
