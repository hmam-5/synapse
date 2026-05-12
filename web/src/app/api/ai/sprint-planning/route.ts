import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { tasks } = await req.json()

  const prompt = `
    You are an expert Agile Scrum Master and Product Manager.
    Analyze the following list of tasks and suggest a Sprint Plan.
    Group tasks logically, suggest which tasks are high priority, and identify any potential bottlenecks.

    Tasks:
    ${JSON.stringify(tasks)}
  `

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: 'You are a helpful AI assistant specialized in Agile project management.',
    prompt,
  })

  return result.toTextStreamResponse()
}
