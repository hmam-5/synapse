import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[Stripe] STRIPE_SECRET_KEY is not set. Billing features will be unavailable.')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
})

/**
 * Synapse Billing Plans
 * 
 * These price IDs should match your Stripe Dashboard configuration.
 * Replace them with your actual Stripe Price IDs after creating products.
 */
export const PLANS = {
  free: {
    name: 'Free',
    description: 'For individuals and small teams getting started',
    price: '$0',
    priceId: null,
    features: [
      'Up to 3 team members',
      '5 projects',
      '100 tasks',
      'Basic analytics',
      'Community support',
    ],
  },
  pro: {
    name: 'Pro',
    description: 'For growing teams that need more power',
    price: '$29',
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
    interval: 'month' as const,
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'Unlimited tasks',
      'Advanced analytics',
      'Priority support',
      'AI-powered insights',
      'Custom integrations',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large organizations with advanced needs',
    price: '$99',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_placeholder',
    interval: 'month' as const,
    features: [
      'Everything in Pro',
      'SSO / SAML',
      'Audit logs',
      'Custom RBAC policies',
      'Dedicated support',
      '99.9% SLA',
      'On-premise deployment',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS
