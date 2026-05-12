import { createProject } from '../actions'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <Link href="/dashboard/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create Project</h1>
        <p className="text-muted-foreground text-sm mt-1">Set up a new project for your organization</p>
      </div>

      <form action={createProject} className="space-y-6 border border-border bg-card rounded-2xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">Project Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="e.g. Synapse Core"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="identifier">Identifier</label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              maxLength={5}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all uppercase"
              placeholder="e.g. SYN"
            />
            <p className="text-xs text-muted-foreground">Used as task prefix: SYN-101</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
            placeholder="What is this project about?"
          />
        </div>

        {/* Organization ID — in a real app this would come from context/session */}
        <input type="hidden" name="organization_id" value="" />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_private"
            name="is_private"
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="is_private" className="text-sm font-medium">Make this project private</label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link
            href="/dashboard/projects"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors group"
          >
            Create Project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  )
}
