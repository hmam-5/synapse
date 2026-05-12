import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update Supabase auth session
  const response = await updateSession(request)

  // 1. Strict Content Security Policy (CSP)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co https://avatars.githubusercontent.com;
    font-src 'self' data:;
    connect-src 'self' wss://*.supabase.co https://*.supabase.co;
    frame-ancestors 'none';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // CSRF protection - check origin on mutations
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    if (origin && host && new URL(origin).host !== host) {
      return new NextResponse('Invalid origin - CSRF protection', { status: 403 })
    }
  }

  // Redis Rate Limiting logic could be injected here for specific API routes
  // e.g. if (request.nextUrl.pathname.startsWith('/api/')) { rateLimit(request) }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
