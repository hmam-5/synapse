import { Building2, Globe, Hash, Image } from 'lucide-react'
import { updateOrganization } from '../actions'

export default function OrganizationSettingsPage() {
  // In a real app, we'd get the active org from the context/server
  // For now, this page renders a form that requires organization_id

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Organization</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your workspace settings and branding</p>
      </div>

      <form action={updateOrganization} className="space-y-6">
        {/* General Settings */}
        <div className="border border-border bg-card rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            General Settings
          </h3>

          <input type="hidden" name="organization_id" value="" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="org-name" className="text-sm font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Organization Name
              </label>
              <input
                id="org-name"
                name="name"
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="org-slug" className="text-sm font-medium flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                URL Slug
              </label>
              <div className="flex items-center gap-0">
                <span className="px-3 py-2.5 rounded-l-lg border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                  synapse.app/
                </span>
                <input
                  id="org-slug"
                  name="slug"
                  type="text"
                  className="flex-1 px-4 py-2.5 rounded-r-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  placeholder="acme-corp"
                />
              </div>
              <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, and hyphens</p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="org-logo" className="text-sm font-medium flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" />
              Logo URL
            </label>
            <input
              id="org-logo"
              name="logo_url"
              type="url"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        {/* Billing Section (placeholder) */}
        <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-primary" />
            Billing & Plan
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
            <div>
              <p className="font-medium text-sm">Free Plan</p>
              <p className="text-xs text-muted-foreground mt-0.5">Up to 5 members, 10 projects, unlimited tasks</p>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
          >
            Save Organization
          </button>
        </div>
      </form>
    </div>
  )
}
