import { auth } from "@/core/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	// THIS IS NOT SECURE!
	// This is the recommended approach to optimistically redirect users
	// We recommend handling auth checks in each page/route
	if (!session) {
		const url = new URL("/auth/signin", request.url);
		const searchParams = url.searchParams;

		searchParams.set("from", request.url);
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/confirmation",
		"/my-bookings",
		"/passengers",
		"/payment",
		"/summary",
		"/",
	], // Specify the routes the middleware applies to
};
