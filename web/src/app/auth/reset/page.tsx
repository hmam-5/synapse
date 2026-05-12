import Link from 'next/link'
import { resetPassword } from './actions'
import { ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams
  const error = params?.error
  const success = params?.success

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 ease-out">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <KeyRound className="w-7 h-7 text-primary" />
          Reset Password
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a password reset link
        </p>
      </div>

      {success && (
        <div className="p-4 text-sm bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-green-500">Email sent!</p>
            <p className="text-muted-foreground mt-1">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      <form className="space-y-4" action={resetPassword}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="name@enterprise.com"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm group"
        >
          Send Reset Link
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  )
}
