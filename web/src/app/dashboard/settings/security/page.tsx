import { Shield, Key, Smartphone, Fingerprint } from 'lucide-react'
import { updatePassword } from '../actions'
import { MfaSetup } from './mfa-setup'
import { PasskeySetup } from './passkey-setup'
import { RecoveryCodes } from './recovery-codes'

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Security</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage password and authentication</p>
      </div>

      <form action={updatePassword} className="border border-border bg-card rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          Change Password
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
            <input id="new-password" name="new_password" type="password" required minLength={8}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              placeholder="••••••••" />
            <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</label>
            <input id="confirm-password" name="confirm_password" type="password" required minLength={8}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              placeholder="••••••••" />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-border">
          <button type="submit" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors">
            Update Password
          </button>
        </div>
      </form>

      <div className="border border-border bg-card rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          Multi-Factor Authentication
        </h3>
        <MfaSetup />
      </div>

      <div className="border border-border bg-card rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-primary" />
          Passkeys (WebAuthn)
        </h3>
        <PasskeySetup />
      </div>

      <RecoveryCodes />

      <div className="border border-destructive/30 bg-destructive/5 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-destructive flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Danger Zone
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Delete Account</p>
            <p className="text-xs text-muted-foreground">Permanently remove your account</p>
          </div>
          <button type="button" disabled className="text-sm font-medium text-destructive border border-destructive/30 px-4 py-2 rounded-lg disabled:opacity-50">Delete Account</button>
        </div>
      </div>
    </div>
  )
}
