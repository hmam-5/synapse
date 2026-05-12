import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login?error=Missing+invitation+token', request.url))
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Store the token and redirect to login, so after login they can accept
    return NextResponse.redirect(new URL(`/auth/login?invite_token=${token}`, request.url))
  }

  // Call the accept_invitation database function
  const { data, error } = await supabase.rpc('accept_invitation', {
    invitation_token: token,
  })

  if (error || data?.error) {
    const errMsg = error?.message || data?.error || 'Failed to accept invitation'
    return NextResponse.redirect(new URL(`/dashboard?error=${encodeURIComponent(errMsg)}`, request.url))
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
