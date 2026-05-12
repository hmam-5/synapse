import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Synapse <noreply@synapse.app>'

/**
 * Synapse Email Service
 * 
 * Centralized email sending via Resend.
 * All email templates are defined here so they can be
 * reused across Server Actions and API routes.
 */

export async function sendInvitationEmail(params: {
  to: string
  inviterName: string
  organizationName: string
  inviteUrl: string
  role: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `You've been invited to join ${params.organizationName} on Synapse`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: #6366f1; color: white; font-size: 24px; font-weight: bold; width: 48px; height: 48px; line-height: 48px; border-radius: 12px;">S</div>
        </div>
        <h1 style="font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 8px; color: #111827;">You're invited!</h1>
        <p style="color: #6b7280; text-align: center; margin-bottom: 32px;">
          <strong>${params.inviterName}</strong> has invited you to join <strong>${params.organizationName}</strong> as a <strong>${params.role}</strong>.
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${params.inviteUrl}" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
            Accept Invitation
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          This invitation expires in 7 days. If you didn't expect this, you can safely ignore it.
        </p>
      </div>
    `,
  })
}

export async function sendTaskAssignmentEmail(params: {
  to: string
  assigneeName: string
  taskTitle: string
  projectName: string
  taskUrl: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `[${params.projectName}] Task assigned: ${params.taskTitle}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: #6366f1; color: white; font-size: 24px; font-weight: bold; width: 48px; height: 48px; line-height: 48px; border-radius: 12px;">S</div>
        </div>
        <h1 style="font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #111827;">New task assigned to you</h1>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-weight: 600; font-size: 16px; margin: 0 0 4px 0; color: #111827;">${params.taskTitle}</p>
          <p style="color: #6b7280; font-size: 13px; margin: 0;">Project: ${params.projectName}</p>
        </div>
        <div style="text-align: center;">
          <a href="${params.taskUrl}" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 10px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
            View Task
          </a>
        </div>
      </div>
    `,
  })
}

export async function sendDeadlineReminderEmail(params: {
  to: string
  taskTitle: string
  deadline: string
  taskUrl: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `⏰ Deadline approaching: ${params.taskTitle}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: #6366f1; color: white; font-size: 24px; font-weight: bold; width: 48px; height: 48px; line-height: 48px; border-radius: 12px;">S</div>
        </div>
        <h1 style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #111827;">⏰ Deadline Reminder</h1>
        <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="font-weight: 600; font-size: 16px; margin: 0 0 4px 0; color: #92400e;">${params.taskTitle}</p>
          <p style="color: #92400e; font-size: 13px; margin: 0;">Due: ${new Date(params.deadline).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style="text-align: center;">
          <a href="${params.taskUrl}" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 10px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
            View Task
          </a>
        </div>
      </div>
    `,
  })
}

export async function sendBillingAlertEmail(params: {
  to: string
  planName: string
  amount: string
  nextBillingDate: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Synapse billing receipt — ${params.planName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: #6366f1; color: white; font-size: 24px; font-weight: bold; width: 48px; height: 48px; line-height: 48px; border-radius: 12px;">S</div>
        </div>
        <h1 style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #111827;">Payment Received</h1>
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 14px; color: #374151;">
            <tr><td style="padding: 4px 0; color: #6b7280;">Plan</td><td style="padding: 4px 0; text-align: right; font-weight: 600;">${params.planName}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Amount</td><td style="padding: 4px 0; text-align: right; font-weight: 600;">${params.amount}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Next billing</td><td style="padding: 4px 0; text-align: right;">${params.nextBillingDate}</td></tr>
          </table>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          Manage your subscription at any time from your Synapse dashboard.
        </p>
      </div>
    `,
  })
}
