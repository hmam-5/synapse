'use client'

import { OrganizationProvider } from '@/lib/providers/organization-provider'
import { ToastProvider } from '@/components/toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <OrganizationProvider>
        {children}
      </OrganizationProvider>
    </ToastProvider>
  )
}
