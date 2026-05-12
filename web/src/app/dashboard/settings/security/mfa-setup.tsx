'use client'

import { useState, useEffect } from 'react'
import { Shield, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

type MfaFactor = {
  id: string
  friendly_name?: string
  factor_type: 'totp' | string
  status: 'verified' | 'unverified'
}

export function MfaSetup() {
  const [factors, setFactors] = useState<MfaFactor[]>([])
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadFactors()
  }, [])

  async function loadFactors() {
    setIsLoading(true)
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (data?.totp) {
      setFactors(data.totp)
    }
    setIsLoading(false)
  }

  async function startEnrollment() {
    setIsEnrolling(true)
    setError(null)
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    })

    if (error) {
      setError(error.message)
      setIsEnrolling(false)
      return
    }

    setFactorId(data.id)
    setQrCode(data.totp.uri)
  }

  async function verifyEnrollment(e: React.FormEvent) {
    e.preventDefault()
    if (!factorId) return

    setError(null)
    setIsLoading(true)

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
    if (challengeError) {
      setError(challengeError.message)
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: verifyCode,
    })

    if (error) {
      setError(error.message)
    } else {
      setIsEnrolling(false)
      setQrCode(null)
      setVerifyCode('')
      await loadFactors()
    }
    setIsLoading(false)
  }

  async function unenroll(id: string) {
    if (!confirm('Are you sure you want to disable MFA?')) return
    setIsLoading(true)
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id })
    if (error) {
      setError(error.message)
    } else {
      await loadFactors()
    }
    setIsLoading(false)
  }

  const isVerified = factors.some(f => f.status === 'verified')

  if (isLoading && factors.length === 0 && !isEnrolling) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center animate-pulse" />
           <div className="space-y-2">
             <div className="h-4 w-24 bg-muted animate-pulse rounded" />
             <div className="h-3 w-40 bg-muted animate-pulse rounded" />
           </div>
        </div>
      </div>
    )
  }

  if (isEnrolling && qrCode) {
    return (
      <div className="p-4 rounded-xl border border-border bg-card/50 space-y-4">
        <h4 className="font-medium text-sm">Configure Authenticator App</h4>
        <p className="text-sm text-muted-foreground">Scan this QR code with Google Authenticator, Authy, or your preferred TOTP app.</p>
        
        <div className="bg-white p-4 rounded-lg inline-block">
          <QRCodeSVG value={qrCode} size={150} />
        </div>

        <form onSubmit={verifyEnrollment} className="space-y-3 pt-2">
          <label className="text-sm font-medium block">Enter 6-digit code</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="123456"
              required
              pattern="[0-9]{6}"
              maxLength={6}
              className="px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none w-32 tracking-widest"
            />
            <button
              type="submit"
              disabled={isLoading || verifyCode.length !== 6}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEnrolling(false)
                setQrCode(null)
                setError(null)
              }}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </form>
      </div>
    )
  }

  return (
    <>
      {error && <div className="p-3 mb-4 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20">{error}</div>}
      
      <div className="flex items-center justify-between p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isVerified ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
            {isVerified ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Shield className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{isVerified ? 'Enabled' : 'Not Enabled'}</p>
            <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
          </div>
        </div>
        
        {isVerified ? (
          <button
            onClick={() => unenroll(factors.find(f => f.status === 'verified')!.id)}
            disabled={isLoading}
            className="text-sm font-medium px-4 py-2 border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-50 transition-colors"
          >
            Disable
          </button>
        ) : (
          <button
            onClick={startEnrollment}
            disabled={isLoading}
            className="text-sm font-medium px-4 py-2 border border-border hover:bg-accent rounded-lg disabled:opacity-50 transition-colors"
          >
            Setup MFA
          </button>
        )}
      </div>
    </>
  )
}
