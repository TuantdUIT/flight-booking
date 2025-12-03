import { Footer } from "@/core/components/layouts/footer";
import { Navbar } from "@/core/components/layouts/navbar";
import { Button } from "@/core/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/card";
import { auth } from "@/core/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import * as React from "react";

interface ProtectedLayoutProps {
	children: React.ReactNode;
}

export default async function ProtectedLayout({
	children,
}: ProtectedLayoutProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Access Denied</CardTitle>
						<CardDescription>
							You must be authenticated to access this page.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link href="/auth/signin">Sign In</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<div className="flex-1">{children}</div>
			<Footer />
		</div>
	);
}
