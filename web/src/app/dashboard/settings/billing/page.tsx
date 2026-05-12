import { CreditCard, Check, Sparkles, Building2, Zap, CheckCircle2, XCircle } from 'lucide-react'
import { PLANS } from '@/lib/stripe'
import { BillingActions } from './billing-actions'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const params = await searchParams
  const currentPlan = 'free' // In production, fetch from org's Supabase record

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Billing</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your subscription and billing details</p>
      </div>

      {params?.success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <div>
            <p className="font-medium text-green-500">Subscription activated!</p>
            <p className="text-sm text-muted-foreground">Your plan has been upgraded successfully.</p>
          </div>
        </div>
      )}

      {params?.canceled && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3">
          <XCircle className="w-5 h-5 text-amber-500" />
          <p className="text-sm text-amber-500">Checkout was cancelled. No charges were made.</p>
        </div>
      )}

      {/* Current Plan Badge */}
      <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Current Plan: <span className="text-primary">{PLANS[currentPlan].name}</span></p>
              <p className="text-sm text-muted-foreground">{PLANS[currentPlan].description}</p>
            </div>
          </div>
          <span className="text-2xl font-bold">{PLANS[currentPlan].price}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <div className="border border-border bg-card rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">{PLANS.free.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{PLANS.free.description}</p>
            <p className="text-3xl font-bold mt-4">{PLANS.free.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
          </div>
          <ul className="space-y-3 flex-1 mb-6">
            {PLANS.free.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <button disabled className="w-full py-2.5 rounded-lg border border-border text-sm font-medium disabled:opacity-50">
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="border-2 border-primary bg-card rounded-2xl p-6 shadow-lg flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
          </div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">{PLANS.pro.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{PLANS.pro.description}</p>
            <p className="text-3xl font-bold mt-4">{PLANS.pro.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
          </div>
          <ul className="space-y-3 flex-1 mb-6">
            {PLANS.pro.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <BillingActions priceId={PLANS.pro.priceId} planName="Pro" />
        </div>

        {/* Enterprise Plan */}
        <div className="border border-border bg-card rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">{PLANS.enterprise.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{PLANS.enterprise.description}</p>
            <p className="text-3xl font-bold mt-4">{PLANS.enterprise.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
          </div>
          <ul className="space-y-3 flex-1 mb-6">
            {PLANS.enterprise.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <BillingActions priceId={PLANS.enterprise.priceId} planName="Enterprise" />
        </div>
      </div>
    </div>
  )
}
