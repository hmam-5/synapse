'use client'

import { useState, useTransition, useCallback } from 'react'
import { updateTaskStatus } from './kanban-actions'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import type { TaskStatus, TaskPriority } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  project?: { identifier: string } | null
  assignee?: { full_name: string | null; email: string } | null
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'done', label: 'Done' },
]

export function KanbanBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isPending, startTransition] = useTransition()
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingId(taskId)
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = useCallback((e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    setDraggingId(null)

    if (!taskId) return

    const taskIndex = tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1 || tasks[taskIndex].status === status) return

    // Optimistic update
    const previousTasks = [...tasks]
    const updatedTasks = [...tasks]
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status }
    setTasks(updatedTasks)

    startTransition(async () => {
      try {
        await updateTaskStatus(taskId, status)
      } catch (error) {
        console.error('Failed to update task status:', error)
        // Revert on failure
        setTasks(previousTasks)
      }
    })
  }, [tasks])

  return (
    <div className="flex gap-6 h-[calc(100vh-16rem)] overflow-x-auto pb-4">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id)

        return (
          <div
            key={column.id}
            className="flex flex-col w-80 shrink-0 bg-muted/40 rounded-2xl p-4 border border-border"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-semibold text-sm">{column.label}</h3>
              <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 min-h-[150px]">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={() => setDraggingId(null)}
                  className={cn(
                    'cursor-grab active:cursor-grabbing',
                    draggingId === task.id ? 'opacity-50' : 'opacity-100'
                  )}
                >
                  <Card padding="sm" hover className="bg-card">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium leading-tight">{task.title}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        {task.project && (
                          <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            {task.project.identifier}
                          </span>
                        )}
                        <Badge
                          size="sm"
                          variant={
                            task.priority === 'high' || task.priority === 'urgent'
                              ? 'error'
                              : task.priority === 'medium'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <Avatar
                        size="xs"
                        name={task.assignee?.full_name}
                        email={task.assignee?.email}
                      />
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
