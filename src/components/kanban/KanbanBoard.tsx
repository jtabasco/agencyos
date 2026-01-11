'use client'

import { useState, useCallback } from 'react'
import { Task, TaskStatus, Profile, UserRole } from '@/types/database'
import { updateTaskStatus } from '@/actions/tasks'

interface KanbanBoardProps {
  tasks: Task[]
  teamMembers?: Profile[]
  userRole: UserRole
  projectId?: string
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'border-stardust-400' },
  { id: 'in_progress', title: 'In Progress', color: 'border-cosmic-400' },
  { id: 'review', title: 'Review', color: 'border-nebula-400' },
  { id: 'client_approval', title: 'Client Approval', color: 'border-amber-400' },
  { id: 'done', title: 'Done', color: 'border-emerald-400' },
]

export function KanbanBoard({ tasks, teamMembers = [], userRole, projectId }: KanbanBoardProps) {
  const [localTasks, setLocalTasks] = useState(tasks)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const canMoveCards = userRole === 'owner' || userRole === 'pm'

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    if (!canMoveCards && task.assigned_to !== task.id) return
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }, [canMoveCards])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault()
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    // Optimistic update
    setLocalTasks(prev =>
      prev.map(t =>
        t.id === draggedTask.id ? { ...t, status: newStatus } : t
      )
    )
    setIsUpdating(draggedTask.id)

    try {
      const result = await updateTaskStatus(draggedTask.id, newStatus)
      if (result.error) {
        // Revert on error
        setLocalTasks(prev =>
          prev.map(t =>
            t.id === draggedTask.id ? { ...t, status: draggedTask.status } : t
          )
        )
      }
    } catch {
      // Revert on error
      setLocalTasks(prev =>
        prev.map(t =>
          t.id === draggedTask.id ? { ...t, status: draggedTask.status } : t
        )
      )
    } finally {
      setIsUpdating(null)
      setDraggedTask(null)
    }
  }, [draggedTask])

  const getTasksByStatus = (status: TaskStatus) =>
    localTasks.filter(task => task.status === status)

  const getAssigneeName = (assignedTo: string | null) => {
    if (!assignedTo) return 'Unassigned'
    const member = teamMembers.find(m => m.id === assignedTo)
    return member?.full_name || member?.email || 'Unknown'
  }

  const getAssigneeInitial = (assignedTo: string | null) => {
    const name = getAssigneeName(assignedTo)
    return name.charAt(0).toUpperCase()
  }

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    const now = new Date()
    const isOverdue = date < now
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { formatted, isOverdue }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(column => (
        <div
          key={column.id}
          className={`min-w-[280px] flex-1 rounded-2xl border-t-4 ${column.color} bg-space-900/50 backdrop-blur-sm`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stardust-100">{column.title}</h3>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-space-800 text-xs text-stardust-400">
                {getTasksByStatus(column.id).length}
              </span>
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-3 p-4 pt-0">
            {getTasksByStatus(column.id).map(task => {
              const dueInfo = formatDueDate(task.due_date)
              const isDragging = draggedTask?.id === task.id
              const updating = isUpdating === task.id

              return (
                <div
                  key={task.id}
                  draggable={canMoveCards || task.assigned_to === task.id}
                  onDragStart={(e) => handleDragStart(e, task)}
                  className={`group cursor-grab rounded-xl border border-space-700/50 bg-space-800/50 p-4 transition-all hover:border-cosmic-500/50 hover:shadow-lg hover:shadow-cosmic-500/10 active:cursor-grabbing ${
                    isDragging ? 'opacity-50' : ''
                  } ${updating ? 'animate-pulse' : ''}`}
                >
                  {/* Task Title */}
                  <h4 className="font-medium text-stardust-100">{task.title}</h4>

                  {/* Task Description */}
                  {task.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-stardust-400">
                      {task.description}
                    </p>
                  )}

                  {/* Task Meta */}
                  <div className="mt-3 flex items-center justify-between">
                    {/* Due Date */}
                    {dueInfo && (
                      <span
                        className={`flex items-center gap-1 text-xs ${
                          dueInfo.isOverdue ? 'text-red-400' : 'text-stardust-400'
                        }`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {dueInfo.formatted}
                      </span>
                    )}

                    {/* Assignee */}
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-xs font-medium text-white"
                      title={getAssigneeName(task.assigned_to)}
                    >
                      {getAssigneeInitial(task.assigned_to)}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Empty state */}
            {getTasksByStatus(column.id).length === 0 && (
              <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-space-700/50 text-sm text-stardust-400">
                No tasks
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
