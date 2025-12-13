import { authClient } from "@/core/lib/auth/client";
import { redirect } from "next/navigation";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Server-side check for admin role using client
	const session = await authClient.getSession();

	if (!session?.data?.user) {
		redirect("/auth/signin");
	}

	if (session.data.user.role !== "admin") {
		redirect("/");
	}

	return <>{children}</>;
}
