import { auth } from "@/core/lib/auth";
import { authClient } from "@/core/lib/auth/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Server-side check for admin role using client
	const session = await auth.api.getSession({
		headers: await headers()
	});

	if (!session?.user) {
		redirect("/auth/signin");
	}

	if (session?.user.role !== "admin") {
		redirect("/");
	}

	return <>{children}</>;
}
