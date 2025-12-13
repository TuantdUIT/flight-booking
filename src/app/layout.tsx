import { QueryProvider } from "@/core/lib/providers/query-provider";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

// Load Inter with all necessary subsets and weights for the design system
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

export const metadata: Metadata = {
	title: "UniAir - University Airline Booking",
	description:
		"Book your flights with ease - University Airline Ticket Booking System",
	generator: "v0.app",
	icons: {
		icon: [
			{
				url: "/icon-light-32x32.png",
				media: "(prefers-color-scheme: light)",
			},
			{
				url: "/icon-dark-32x32.png",
				media: "(prefers-color-scheme: dark)",
			},
			{
				url: "/icon.svg",
				type: "image/svg+xml",
			},
		],
		apple: "/apple-icon.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
				<QueryProvider>{children}</QueryProvider>
				<Analytics />
			</body>
		</html>
	);
}
