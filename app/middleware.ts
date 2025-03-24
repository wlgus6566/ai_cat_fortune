import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './api/auth/[...nextauth]/auth';

// 공개 경로 정의
const publicPaths = [
  '/auth/signin',
  '/auth/error',
  '/api/auth',
];

// 정적 파일 및 API 경로 체크 헬퍼 함수
const isStaticFile = (pathname: string) => {
  return /\.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$/i.test(pathname);
};

const isApiPath = (pathname: string) => {
  return pathname.startsWith('/api/');
};

const isPublicPath = (pathname: string) => {
  return publicPaths.some(path => pathname.startsWith(path)) || pathname === '/';
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 정적 파일 및 특정 API 경로는 인증 검사 건너뛰기
  if (isStaticFile(pathname) || isApiPath(pathname)) {
    return NextResponse.next();
  }
  
  // 공개 경로는 인증 체크 건너뛰기
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // 인증 세션 체크
  const session = await auth();
  
  console.log('미들웨어 인증 확인:', { pathname, isAuthenticated: !!session });
  
  // 인증이 필요한 경로 && 인증 세션이 없음
  if (!session) {
    // 현재 URL을 callbackUrl로 사용하여 로그인 페이지로 리다이렉트
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// 미들웨어가 실행될 경로 정의
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|fonts|assets).*)',
  ],
}; 