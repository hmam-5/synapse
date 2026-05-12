'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Organization, AppRole } from '@/lib/types'

interface OrgContext {
  /** The currently active organization */
  activeOrg: Organization | null
  /** All organizations the user belongs to */
  organizations: Organization[]
  /** The user's role in the active organization */
  activeRole: AppRole | null
  /** Switch to a different organization */
  switchOrg: (orgId: string) => void
  /** Loading state */
  isLoading: boolean
}

const OrganizationContext = createContext<OrgContext>({
  activeOrg: null,
  organizations: [],
  activeRole: null,
  switchOrg: () => {},
  isLoading: true,
})

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

const ACTIVE_ORG_KEY = 'synapse:active_org_id'

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null)
  const [activeRole, setActiveRole] = useState<AppRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  // Fetch organizations the user belongs to
  useEffect(() => {
    async function fetchOrgs() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          return
        }

        // Get org memberships with organization data
        const { data: memberships, error } = await supabase
          .from('organization_members')
          .select('organization_id, role, organization:organizations(*)')
          .eq('user_id', user.id)

        if (error || !memberships) {
          setIsLoading(false)
          return
        }

        const orgs = memberships
          .map((m) => m.organization as unknown as Organization)
          .filter(Boolean)

        setOrganizations(orgs)

        // Restore last active org from localStorage, or default to first
        const storedOrgId = typeof window !== 'undefined'
          ? localStorage.getItem(ACTIVE_ORG_KEY)
          : null

        const restored = orgs.find((o) => o.id === storedOrgId)
        const defaultOrg = restored || orgs[0] || null

        if (defaultOrg) {
          setActiveOrg(defaultOrg)
          const membership = memberships.find(
            (m) => m.organization_id === defaultOrg.id
          )
          setActiveRole((membership?.role as AppRole) || null)
        }
      } catch {
        // Silently fail — user may not be authenticated
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrgs()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const switchOrg = useCallback(
    (orgId: string) => {
      const org = organizations.find((o) => o.id === orgId)
      if (!org) return

      setActiveOrg(org)
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACTIVE_ORG_KEY, orgId)
      }

      // Re-derive the role
      // In production, this would come from the JWT claims
      // For now, we re-fetch
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return
        supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', user.id)
          .eq('organization_id', orgId)
          .single()
          .then(({ data }) => {
            setActiveRole((data?.role as AppRole) || null)
          })
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [organizations]
  )

  return (
    <OrganizationContext.Provider
      value={{ activeOrg, organizations, activeRole, switchOrg, isLoading }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}
