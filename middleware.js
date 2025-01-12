import { NextResponse } from 'next/server';
import { verifyToken } from './lib/utils';

export async function middleware(request) {
  // 需要认证的路由
  const protectedPaths = ['/dashboard'];
  
  // 检查当前路径是否需要认证
  const path = request.nextUrl.pathname;
  if (protectedPaths.some(prefix => path.startsWith(prefix))) {
    const token = request.cookies.get('auth-token')?.value;
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}
