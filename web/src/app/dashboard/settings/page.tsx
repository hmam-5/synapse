import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile } from './actions'
import { Mail, User } from 'lucide-react'
import { AvatarUpload } from './avatar-upload'

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) redirect('/auth/login')

  // Try to get profile from public.users, fall back to auth user data
  let profile: { full_name?: string | null; avatar_url?: string | null; email?: string } | null = null
  try {
    const { data } = await supabase
      .from('users')
      .select('full_name, avatar_url, email')
      .eq('id', user.id)
      .single()
    profile = data
  } catch {
    // Table might not exist yet
  }

  const displayName = profile?.full_name || user.user_metadata?.full_name || ''
  const email = profile?.email || user.email || ''

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal information and avatar</p>
      </div>

      {/* Avatar Section */}
      <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <AvatarUpload 
            userId={user.id} 
            initialUrl={profile?.avatar_url || user.user_metadata?.avatar_url}
            fallbackInitials={displayName ? displayName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
          />
          <div>
            <h3 className="font-semibold">{displayName || 'Unnamed User'}</h3>
            <p className="text-sm text-muted-foreground">{email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Member since {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form action={updateProfile} className="border border-border bg-card rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="full_name" className="text-sm font-medium">Full Name</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={displayName}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email-display" className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email
            </label>
            <input
              id="email-display"
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-muted-foreground cursor-not-allowed text-sm"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed here. Contact your admin.</p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
