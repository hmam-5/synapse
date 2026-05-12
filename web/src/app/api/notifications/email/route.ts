import { NextRequest, NextResponse } from 'next/server'
import { sendInvitationEmail, sendTaskAssignmentEmail, sendDeadlineReminderEmail } from '@/lib/email'

/**
 * POST /api/notifications/email
 * 
 * Internal API route for sending email notifications.
 * Protected by a shared secret header to prevent abuse.
 * Called by Server Actions and database triggers (via webhook).
 */
export async function POST(request: NextRequest) {
  // Validate internal API key
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, ...params } = body

    switch (type) {
      case 'invitation':
        await sendInvitationEmail(params)
        break
      case 'task_assignment':
        await sendTaskAssignmentEmail(params)
        break
      case 'deadline_reminder':
        await sendDeadlineReminderEmail(params)
        break
      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Email API] Failed to send:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
