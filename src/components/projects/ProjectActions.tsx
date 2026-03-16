'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cancelProject, reactivateProject } from '@/actions/projects'
import type { Project } from '@/types/database'

interface ProjectActionsProps {
  project: Project
  canEdit: boolean
  isOwner: boolean
}

export function ProjectActions({ project, canEdit, isOwner }: ProjectActionsProps) {
  const router = useRouter()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReactivateConfirm, setShowReactivateConfirm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCancelProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancelReason.trim()) {
      setError('Por favor ingresa un motivo de cancelación')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      console.log('Cancelling project:', project.id, 'with reason:', cancelReason)
      const result = await cancelProject(project.id, cancelReason)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
      } else if (result.success) {
        // Success - refresh the page
        router.refresh()
        setShowCancelModal(false)
        setCancelReason('')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error cancelling project'
      console.error('Error cancelling project:', error)
      setError(errorMsg)
      setIsSubmitting(false)
    }
  }

  const handleReactivateProject = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      console.log('Reactivating project:', project.id)
      const result = await reactivateProject(project.id)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
      } else if (result.success) {
        // Success - refresh the page
        router.refresh()
        setShowReactivateConfirm(false)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error reactivating project'
      console.error('Error reactivating project:', error)
      setError(errorMsg)
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Cancel Button - shown if project is active and user can edit */}
      {canEdit && project.status !== 'cancelled' && (
        <button
          onClick={() => setShowCancelModal(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel Project
        </button>
      )}

      {/* Reactivate Button - shown if project is cancelled and user is owner */}
      {isOwner && project.status === 'cancelled' && (
        <button
          onClick={() => setShowReactivateConfirm(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reactivate Project
        </button>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-space-700 bg-space-900 p-6">
            <h2 className="text-xl font-bold text-stardust-100">Cancel Project</h2>
            <p className="mt-2 text-sm text-stardust-400">
              This will cancel the project and all its tasks. Provide a reason for the cancellation.
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleCancelProject} className="mt-6 space-y-4">
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-stardust-100">
                  Cancellation Reason
                </label>
                <textarea
                  id="reason"
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value)
                    setError(null)
                  }}
                  placeholder="Enter reason for cancellation..."
                  className="mt-2 w-full rounded-lg border border-space-700 bg-space-800 px-3 py-2 text-stardust-100 placeholder-stardust-500 focus:border-cosmic-500 focus:outline-none focus:ring-1 focus:ring-cosmic-500"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false)
                    setCancelReason('')
                    setError(null)
                  }}
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg border border-space-700 bg-space-800 px-4 py-2 text-sm font-medium text-stardust-100 transition-colors hover:bg-space-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!cancelReason.trim() || isSubmitting}
                  className="flex-1 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reactivate Confirmation Modal */}
      {showReactivateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-space-700 bg-space-900 p-6">
            <h2 className="text-xl font-bold text-stardust-100">Reactivate Project</h2>
            <p className="mt-2 text-sm text-stardust-400">
              This will reactivate the project and restore cancelled tasks to "To Do" status. Are you sure?
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowReactivateConfirm(false)
                  setError(null)
                }}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-space-700 bg-space-800 px-4 py-2 text-sm font-medium text-stardust-100 transition-colors hover:bg-space-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReactivateProject}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/30 disabled:opacity-50"
              >
                {isSubmitting ? 'Reactivating...' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
