import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Получаем куки сессии
  const sessionCookie = request.cookies.get('session');

  // Если запрос идет к API или к странице входа, пропускаем
  if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  // Если нет куки сессии, редиректим на страницу входа
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Проверяем валидность данных сессии
    const session = JSON.parse(sessionCookie.value);
    if (!session.userId || !session.role || !session.shiftId) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Если всё в порядке, пропускаем запрос
    return NextResponse.next();
  } catch {
    // Если возникла ошибка при парсинге куки, редиректим на страницу входа
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// Указываем, для каких путей применять middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 