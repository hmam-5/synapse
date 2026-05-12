'use client'

import { useCompletion } from '@ai-sdk/react'
import { Sparkles, Loader2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Task {
  id: string
  title: string
  status: string
  priority: string
}

export function SprintPlannerAI({ tasks }: { tasks: Task[] }) {
  const { completion, isLoading, complete } = useCompletion({
    api: '/api/ai/sprint-planning',
  })

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          AI Sprint Planner
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          className="bg-background"
          onClick={() => complete('', { body: { tasks } })}
          disabled={isLoading || tasks.length === 0}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {completion ? 'Regenerate Plan' : 'Generate Plan'}
        </Button>
      </CardHeader>
      <CardContent>
        {completion ? (
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {completion}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click &quot;Generate Plan&quot; to let AI analyze your tasks and suggest an optimal sprint board arrangement, prioritizing critical blockers.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
