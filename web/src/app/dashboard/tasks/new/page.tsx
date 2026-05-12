import { createTask } from '../actions'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function NewTaskPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <Link href="/dashboard/tasks" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create Task</h1>
        <p className="text-muted-foreground text-sm mt-1">Add a new task to track work</p>
      </div>

      <form action={createTask} className="space-y-6 border border-border bg-card rounded-2xl p-8 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="e.g. Implement user authentication"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
            placeholder="Describe the task in detail..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            >
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="due_date">Due Date</label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Hidden fields — in production these come from context */}
        <input type="hidden" name="project_id" value="" />
        <input type="hidden" name="organization_id" value="" />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link
            href="/dashboard/tasks"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors group"
          >
            Create Task
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  )
}
