import { createClient } from '@/lib/supabase/server'
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

export const maxDuration = 30

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { projectId } = await req.json()

  if (!projectId) {
    return new Response('Project ID required', { status: 400 })
  }

  // Get project details
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      client:profiles!client_id(full_name, email),
      manager:profiles!manager_id(full_name, email)
    `)
    .eq('id', projectId)
    .single()

  if (!project) {
    return new Response('Project not found', { status: 404 })
  }

  // Get tasks for this project
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!assigned_to(full_name, email)
    `)
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })

  // Get recent updates
  const { data: updates } = await supabase
    .from('updates')
    .select(`
      *,
      author:profiles!author_id(full_name)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(20)

  // Calculate task statistics
  const taskStats = {
    total: tasks?.length || 0,
    done: tasks?.filter(t => t.status === 'done').length || 0,
    inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
    todo: tasks?.filter(t => t.status === 'todo').length || 0,
    review: tasks?.filter(t => t.status === 'review' || t.status === 'client_approval').length || 0,
  }

  // Format tasks for context
  const formattedTasks = tasks?.map(t => ({
    title: t.title,
    status: t.status,
    assignee: t.assignee?.full_name || 'Unassigned',
    dueDate: t.due_date,
    description: t.description?.substring(0, 100),
  })) || []

  // Format updates for context
  const formattedUpdates = updates?.map(u => ({
    type: u.type,
    content: u.content,
    author: u.author?.full_name || 'System',
    date: u.created_at,
  })) || []

  const systemPrompt = `You are a Senior Project Manager at a high-end digital agency. Your task is to generate an executive status report for a client.

Write in a professional but warm tone. Be concise and focus on value delivered. Use bullet points where appropriate.

IMPORTANT GUIDELINES:
- Lead with achievements and progress
- Frame challenges as "areas of focus" with clear action plans
- Include specific metrics when available
- End with a clear next steps section
- Keep the total report under 400 words
- Use markdown formatting for readability

PROJECT CONTEXT:
Name: ${project.name}
Status: ${project.status}
Progress: ${project.progress_percent}%
Client: ${project.client?.full_name || 'Not assigned'}
Manager: ${project.manager?.full_name || 'Not assigned'}

TASK STATISTICS:
- Total Tasks: ${taskStats.total}
- Completed: ${taskStats.done}
- In Progress: ${taskStats.inProgress}
- In Review: ${taskStats.review}
- To Do: ${taskStats.todo}

RECENT TASKS:
${JSON.stringify(formattedTasks, null, 2)}

RECENT UPDATES:
${JSON.stringify(formattedUpdates, null, 2)}

Generate a professional status report for the client based on this data.`

  const result = streamText({
    model: openrouter('google/gemini-2.0-flash-001'),
    system: systemPrompt,
    prompt: 'Generate the executive status report for this project.',
  })

  return result.toTextStreamResponse()
}
