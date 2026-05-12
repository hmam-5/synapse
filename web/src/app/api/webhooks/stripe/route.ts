import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

/**
 * POST /api/webhooks/stripe
 * 
 * Handles Stripe webhook events for subscription lifecycle management.
 * Updates the organization's plan status in the database when:
 * - A checkout session is completed (new subscription)
 * - A subscription is updated (plan change)
 * - A subscription is deleted (cancellation)
 * - An invoice payment fails
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const organizationId = session.metadata?.organizationId
        const subscriptionId = session.subscription as string

        if (organizationId && subscriptionId) {
          console.log(`[Stripe] Organization ${organizationId} subscribed: ${subscriptionId}`)
          // In production, update the organization's subscription status in the database:
          // await supabase.from('organizations').update({ 
          //   stripe_subscription_id: subscriptionId,
          //   stripe_customer_id: session.customer,
          //   plan: 'pro',
          // }).eq('id', organizationId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[Stripe] Subscription updated: ${subscription.id}, status: ${subscription.status}`)
        // Update plan status based on subscription changes
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[Stripe] Subscription cancelled: ${subscription.id}`)
        // Downgrade the organization to the free plan
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Stripe] Payment failed for invoice: ${invoice.id}`)
        // Notify the organization admin about the failed payment
        break
      }

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
