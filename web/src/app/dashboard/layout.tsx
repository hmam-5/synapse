import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LogOut, Settings, LayoutDashboard, CheckSquare, Users, Folder, Settings2 } from 'lucide-react'
import { Providers } from '@/lib/providers'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { CommandPalette } from '@/components/command-palette/command-palette'

import { TanstackProvider } from '@/lib/query-provider'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col justify-between hidden md:flex z-10 shadow-sm">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-lg">S</span>
            </div>
            Synapse
          </Link>
          
          <nav className="space-y-1">
            <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Overview" active />
            <NavItem href="/dashboard/projects" icon={<Folder className="w-5 h-5" />} label="Projects" />
            <NavItem href="/dashboard/tasks" icon={<CheckSquare className="w-5 h-5" />} label="Tasks" />
            <NavItem href="/dashboard/team" icon={<Users className="w-5 h-5" />} label="Team" />
            <NavItem href="/dashboard/settings" icon={<Settings2 className="w-5 h-5" />} label="Settings" />
          </nav>
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-medium">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground">{user.user_metadata?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-muted/20">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
          <h2 className="text-sm font-medium text-muted-foreground">Workspace</h2>
          <div className="flex items-center gap-3">
            <CommandPalette />
            <NotificationBell />
            <form action="/auth/signout" method="post">
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </form>
          </div>
        </header>
        <div className="flex-1 p-8">
          <TanstackProvider>
            <Providers>
              {children}
            </Providers>
          </TanstackProvider>
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
        active 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}
