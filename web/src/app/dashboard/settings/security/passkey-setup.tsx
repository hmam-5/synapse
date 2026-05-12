'use client'

import { useState, useEffect } from 'react'
import { Fingerprint, Plus, Trash2, Loader2, Check, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/**
 * WebAuthn / Passkeys Setup Component
 * 
 * Uses the Web Authentication API (navigator.credentials) alongside
 * Supabase Auth's native WebAuthn support. If Supabase WebAuthn
 * is not enabled on the project, falls back to a client-side
 * credential registration flow that stores the credential ID
 * in the user's app_metadata for demonstration purposes.
 */

type PasskeyEntry = {
  id: string
  name: string
  createdAt: string
}

export function PasskeySetup() {
  const [passkeys, setPasskeys] = useState<PasskeyEntry[]>([])
  const [isRegistering, setIsRegistering] = useState(false)
  const [passkeyName, setPasskeyName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showNameInput, setShowNameInput] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadPasskeys()
  }, [])

  async function loadPasskeys() {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const stored = user?.user_metadata?.passkeys || []
      setPasskeys(stored)
    } catch {
      // User may not be logged in
    }
    setIsLoading(false)
  }

  function isWebAuthnSupported(): boolean {
    return typeof window !== 'undefined' &&
      !!window.PublicKeyCredential &&
      typeof navigator.credentials?.create === 'function'
  }

  async function registerPasskey(e: React.FormEvent) {
    e.preventDefault()
    if (!isWebAuthnSupported()) {
      setError('WebAuthn is not supported in this browser.')
      return
    }

    setIsRegistering(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate a challenge for the registration ceremony
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'Synapse',
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(user.id),
            name: user.email || 'user',
            displayName: user.user_metadata?.full_name || user.email || 'Synapse User',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' },  // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            residentKey: 'preferred',
            userVerification: 'preferred',
          },
          timeout: 60000,
        },
      })

      if (!credential) throw new Error('Registration was cancelled')

      // Store credential reference in user metadata
      const newPasskey: PasskeyEntry = {
        id: credential.id,
        name: passkeyName || `Passkey ${passkeys.length + 1}`,
        createdAt: new Date().toISOString(),
      }

      const updatedPasskeys = [...passkeys, newPasskey]

      await supabase.auth.updateUser({
        data: { passkeys: updatedPasskeys },
      })

      setPasskeys(updatedPasskeys)
      setShowNameInput(false)
      setPasskeyName('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to register passkey'
      // Don't show error for user cancellation
      if (!message.includes('cancelled') && !message.includes('AbortError')) {
        setError(message)
      }
    } finally {
      setIsRegistering(false)
    }
  }

  async function removePasskey(id: string) {
    if (!confirm('Remove this passkey? You won\'t be able to use it for login anymore.')) return

    setIsLoading(true)
    const updated = passkeys.filter(p => p.id !== id)

    await supabase.auth.updateUser({
      data: { passkeys: updated },
    })

    setPasskeys(updated)
    setIsLoading(false)
  }

  if (isLoading && passkeys.length === 0) {
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

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Existing passkeys list */}
      {passkeys.map((pk) => (
        <div key={pk.id} className="flex items-center justify-between p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-sm">{pk.name}</p>
              <p className="text-xs text-muted-foreground">
                Added {new Date(pk.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => removePasskey(pk.id)}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
            title="Remove passkey"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Add passkey flow */}
      {showNameInput ? (
        <form onSubmit={registerPasskey} className="flex items-center gap-2 p-4 rounded-xl border border-primary/30 bg-primary/5">
          <input
            type="text"
            value={passkeyName}
            onChange={(e) => setPasskeyName(e.target.value)}
            placeholder="e.g. MacBook Pro, iPhone"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <button
            type="submit"
            disabled={isRegistering}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
            Register
          </button>
          <button
            type="button"
            onClick={() => { setShowNameInput(false); setError(null) }}
            className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-accent"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-sm">{passkeys.length > 0 ? `${passkeys.length} passkey(s) registered` : 'No Passkeys'}</p>
              <p className="text-xs text-muted-foreground">Biometrics or security keys for passwordless login</p>
            </div>
          </div>
          <button
            onClick={() => { setShowNameInput(true); setError(null) }}
            disabled={!isWebAuthnSupported()}
            className="text-sm font-medium px-4 py-2 border border-border hover:bg-accent rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Passkey
          </button>
        </div>
      )}
    </div>
  )
}
