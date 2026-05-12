import { CheckSquare, Plus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getTasks } from './actions'
import { KanbanBoard } from './kanban-board'
import { SprintPlannerAI } from '@/components/ai/sprint-planner'
import type { TaskStatus, TaskPriority } from '@/lib/types'

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: 'To Do', color: 'bg-slate-500/20 text-slate-400' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400' },
  in_review: { label: 'In Review', color: 'bg-yellow-500/20 text-yellow-400' },
  done: { label: 'Done', color: 'bg-green-500/20 text-green-400' },
  canceled: { label: 'Canceled', color: 'bg-red-500/20 text-red-400' },
}

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-slate-500/10 text-slate-400' },
  medium: { label: 'Medium', color: 'bg-blue-500/10 text-blue-400' },
  high: { label: 'High', color: 'bg-orange-500/10 text-orange-400' },
  urgent: { label: 'Urgent', color: 'bg-red-500/10 text-red-400' },
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const error = (await searchParams)?.error
  let tasks: Awaited<ReturnType<typeof getTasks>> = []

  try {
    tasks = await getTasks()
  } catch {
    // Supabase might not be configured yet
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage work across all projects</p>
        </div>
        <Link
          href="/dashboard/tasks/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </Link>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      {tasks.length > 0 && <SprintPlannerAI tasks={tasks} />}

      {tasks.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-16 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
            <CheckSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No tasks yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Create your first task to start tracking work for your team.
          </p>
          <Link
            href="/dashboard/tasks/new"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors mt-2"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </Link>
        </div>
      ) : (
        <KanbanBoard initialTasks={tasks} />
      )}
    </div>
  )
}
