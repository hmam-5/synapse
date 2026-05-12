'use client'

import { useState } from 'react'
import { KeyRound, Download, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react'

export function RecoveryCodes() {
  const [codes, setCodes] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  // In a real app, this would call a Supabase Edge Function to generate hashed codes
  async function generateCodes() {
    setIsGenerating(true)
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000))

    const newCodes = Array.from({ length: 10 }).map(() => {
      const part1 = Math.random().toString(36).substring(2, 6).toUpperCase()
      const part2 = Math.random().toString(36).substring(2, 6).toUpperCase()
      return `${part1}-${part2}`
    })

    setCodes(newCodes)
    setIsGenerating(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(codes.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([codes.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'synapse-recovery-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="border border-border bg-card rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-primary" />
        Backup Recovery Codes
      </h3>

      {codes.length === 0 ? (
        <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-sm">Not Generated</p>
              <p className="text-xs text-muted-foreground">Required if you lose access to your authenticator</p>
            </div>
          </div>
          <button
            onClick={generateCodes}
            disabled={isGenerating}
            className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Generate'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in zoom-in-95">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-600">
              Save these codes in a secure location (like a password manager). Each code can only be used once. If you lose your authenticator app and these codes, you will be permanently locked out of your account.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 bg-muted rounded-xl font-mono text-sm tracking-wider">
            {codes.map((code, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-muted-foreground w-4">{i + 1}.</span>
                <span className="font-semibold select-all">{code}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 py-2 px-4 flex items-center justify-center gap-2 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2 px-4 flex items-center justify-center gap-2 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
