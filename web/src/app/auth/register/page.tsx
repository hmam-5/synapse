import Link from 'next/link'
import { signup, signInWithProvider } from '../actions'
import { ArrowRight, AlertCircle } from 'lucide-react'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function BitbucketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.778 1.413A1.173 1.173 0 000 2.562l3.411 18.66c.071.401.442.673.843.606.027-.005.054-.012.08-.02l14.864-4.246a1.174 1.174 0 00.865-1.026L24 2.559a1.17 1.17 0 00-1.127-1.309H1.181a1.173 1.173 0 00-.403.163zM15.42 13.5H8.761l-1.31-6h9.123z"/>
    </svg>
  )
}

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.919 1.263c-.137-.423-.73-.423-.866 0L1.388 9.452.046 13.587c-.178.55.02 1.161.492 1.503l11.462 8.333 11.464-8.333c.471-.342.669-.953.491-1.503z"/>
    </svg>
  )
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const error = (await searchParams)?.error

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 ease-out">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Create workspace</h1>
        <p className="text-muted-foreground text-sm">
          Set up your Synapse environment to get started
        </p>
      </div>

      <form className="space-y-4" action={signup}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="full_name">Full Name</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="Jane Doe"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Work Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="jane@enterprise.com"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="••••••••"
          />
          <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-destructive">{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm group mt-2"
        >
          Create Account
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form action={signInWithProvider}>
          <input type="hidden" name="provider" value="github" />
          <button type="submit" className="w-full flex items-center justify-center py-3 px-4 bg-card border border-border font-medium rounded-lg hover:bg-accent transition-all shadow-sm">
            <GithubIcon className="w-4 h-4 mr-2" />
            GitHub
          </button>
        </form>
        <form action={signInWithProvider}>
          <input type="hidden" name="provider" value="google" />
          <button type="submit" className="w-full flex items-center justify-center py-3 px-4 bg-card border border-border font-medium rounded-lg hover:bg-accent transition-all shadow-sm">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
        </form>
        <form action={signInWithProvider}>
          <input type="hidden" name="provider" value="bitbucket" />
          <button type="submit" className="w-full flex items-center justify-center py-3 px-4 bg-card border border-border font-medium rounded-lg hover:bg-accent transition-all shadow-sm">
            <BitbucketIcon className="w-4 h-4 mr-2 text-[#0052CC]" />
            Bitbucket
          </button>
        </form>
        <form action={signInWithProvider}>
          <input type="hidden" name="provider" value="gitlab" />
          <button type="submit" className="w-full flex items-center justify-center py-3 px-4 bg-card border border-border font-medium rounded-lg hover:bg-accent transition-all shadow-sm">
            <GitLabIcon className="w-4 h-4 mr-2 text-[#FC6D26]" />
            GitLab
          </button>
        </form>
      </div>


      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  )
}
