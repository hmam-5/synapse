import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { User, Building2, Shield, ScrollText, CreditCard, BarChart3 } from 'lucide-react'

const settingsTabs = [
  { id: 'profile', label: 'Profile', href: '/dashboard/settings', icon: User },
  { id: 'organization', label: 'Organization', href: '/dashboard/settings/organization', icon: Building2 },
  { id: 'security', label: 'Security', href: '/dashboard/settings/security', icon: Shield },
  { id: 'billing', label: 'Billing', href: '/dashboard/settings/billing', icon: CreditCard },
  { id: 'analytics', label: 'Analytics', href: '/dashboard/settings/analytics', icon: BarChart3 },
  { id: 'audit', label: 'Audit Log', href: '/dashboard/settings/audit', icon: ScrollText },
]

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account, organization, and security preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <nav className="w-full md:w-56 shrink-0">
          <div className="space-y-1">
            {settingsTabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
