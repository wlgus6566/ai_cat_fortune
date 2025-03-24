import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요하지 않은 경로들
const publicPaths = [
  '/auth/signin',
  '/auth/error',
  '/api/auth'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // API 경로와 정적 파일은 무시
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.startsWith('/images') ||
    pathname.startsWith('/public') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 공개 경로는 인증 필요 없음
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 토큰 확인
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!token) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('미들웨어 인증 오류:', error);
    // 오류 발생 시 로그인 페이지로 리다이렉트
    const url = new URL('/auth/signin', request.url);
    return NextResponse.redirect(url);
  }
}

// 모든 경로에 미들웨어 적용, 특정 패턴은 제외
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|login_bg.jpeg).*)',
  ],
}; 