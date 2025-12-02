import { auth } from "@/features/auth/config/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/", "/login", "/register"].includes(nextUrl.pathname);
  const isProtectedRoute = ["/my-bookings", "/passengers", "/payment"].some(
    (route) => nextUrl.pathname.startsWith(route)
  );

  // Allow API auth routes
  if (isApiAuthRoute) {
    return;
  }

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  // Redirect to home if accessing login while authenticated
  if (nextUrl.pathname === "/login" && isLoggedIn) {
    return Response.redirect(new URL("/", nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
