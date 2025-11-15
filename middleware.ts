// // middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   // Get the auth token from cookies
//   const token = request.cookies.get('auth-token')?.value;
  
//   const isAuthPage = request.nextUrl.pathname.startsWith('/auth') || 
//                      request.nextUrl.pathname.startsWith('/login');
//   const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard');
  
//   // If user is not authenticated and trying to access protected pages
//   if (!token && isProtectedPage) {
//     const loginUrl = new URL('/auth', request.url);
//     loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
//     return NextResponse.redirect(loginUrl);
//   }
  
//   // If user is authenticated and trying to access auth pages, redirect to dashboard
//   if (token && isAuthPage) {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }
  
//   return NextResponse.next();
// }

// // Specify which routes to run middleware on
// export const config = {
//   matcher: [
//     '/dashboard/:path*',
//     '/auth',
//     '/login',
//   ],
// };



import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;

  // 🚫 Not logged in → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Token exists → allow
  return NextResponse.next();
}

// Apply to dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
