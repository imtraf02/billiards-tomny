import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const pathname = request.nextUrl.pathname;
  
  // Danh sách các route cần bảo vệ
  const protectedRoutes = [
    '/dashboard',
    '/tables',
    '/products', 
    '/bookings',
    '/orders',
    '/categories',
  ];
  
  // Kiểm tra xem route hiện tại có cần bảo vệ không
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Kiểm tra xem có phải trang login không
  const isLoginPage = pathname === '/login';
  
  // Redirect logic
  if (isProtectedRoute && !token) {
    // Chuyển hướng đến login nếu truy cập route bảo vệ mà không có token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  if (isLoginPage && token) {
    // Nếu đã đăng nhập thì redirect về dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Bảo vệ tất cả routes trừ các static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
