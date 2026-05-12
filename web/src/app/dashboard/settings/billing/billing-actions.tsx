'use client'

import { useState } from 'react'
import { Loader2, ArrowRight } from 'lucide-react'

export function BillingActions({ priceId, planName }: { priceId: string; planName: string }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleCheckout() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          organizationId: 'org_placeholder', // In production, pass the real org ID
        }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      console.error('Checkout failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          Upgrade to {planName}
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  )
}
