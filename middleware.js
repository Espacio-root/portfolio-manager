import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
 
export async function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // If it's the dashboard route, verify authentication
  if (path === '/dashboard') {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    // Redirect to login if not authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}
 
export const config = {
  matcher: ['/dashboard']
};
