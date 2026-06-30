import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Role-based route guard checks
    if (pathname.startsWith("/farmer") && token?.role !== "FARMER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=RoleRequired", req.url));
    }
    if (pathname.startsWith("/buyer") && token?.role !== "BUYER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=RoleRequired", req.url));
    }
    if (pathname.startsWith("/transport") && token?.role !== "TRANSPORT" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=RoleRequired", req.url));
    }
    if (pathname.startsWith("/warehouse") && token?.role !== "WAREHOUSE" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=RoleRequired", req.url));
    }
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=AdminRequired", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

// Route matches to protect
export const config = {
  matcher: [
    "/farmer/:path*",
    "/buyer/:path*",
    "/transport/:path*",
    "/warehouse/:path*",
    "/admin/:path*",
    "/api/users/:path*",
    "/api/orders/:path*",
    "/api/ai/:path*"
  ]
};
