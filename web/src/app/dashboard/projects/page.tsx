import { Folder, Plus, Lock, Globe, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getProjects } from './actions'

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const error = (await searchParams)?.error
  let projects: Awaited<ReturnType<typeof getProjects>> = []

  try {
    projects = await getProjects()
  } catch {
    // Supabase might not be configured yet — show empty state gracefully
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your team&apos;s projects and workstreams</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-16 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
            <Folder className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No projects yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Create your first project to start organizing tasks and collaborating with your team.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors mt-2"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group border border-border bg-card rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {project.identifier?.slice(0, 3) || 'PRJ'}
                </div>
                {project.is_private ? (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Globe className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {project.description || 'No description provided'}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {project.team && (
                  <span className="bg-secondary px-2 py-1 rounded-md">{project.team.name}</span>
                )}
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
