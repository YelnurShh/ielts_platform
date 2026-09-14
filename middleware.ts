import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*", "/teacher/:path*", "/practice/:path*", "/lessons/:path*", "/analyzer/:path*", "/portfolio/:path*"],
};

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("auth_session");
  const path = request.nextUrl.pathname;

  const protectedPaths = ["/dashboard", "/practice", "/lessons", "/analyzer", "/portfolio"];
  const teacherPaths = ["/teacher"];
  const isTeacherPath = teacherPaths.some((p) => path.startsWith(p));
  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));

  if (!sessionCookie) {
    if (isProtectedPath || isTeacherPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
