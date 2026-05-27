import { NextRequest, NextResponse } from 'next/server';

// Example: Replace with your real authentication logic
export function middleware(request: NextRequest) {
  // Authentication middleware is disabled for local demo mode.
  // Replace this with real authentication logic when deploying.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/emergency/:path*',
    '/api/sms/:path*',
    '/api/admin/:path*',
  ],
};
