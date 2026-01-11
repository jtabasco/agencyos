'use client'

import { useState } from 'react'
import { useCompletion } from '@ai-sdk/react'

interface AIProjectReportProps {
  projectId: string
  projectName: string
}

export function AIProjectReport({ projectId, projectName }: AIProjectReportProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { completion, isLoading, complete, error } = useCompletion({
    api: '/api/ai/report',
    body: { projectId },
  })

  const handleGenerateReport = async () => {
    setIsOpen(true)
    await complete('')
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleGenerateReport}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-cosmic-500/25 transition-all hover:shadow-cosmic-500/40 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Generate AI Report
          </>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-space-950/80 backdrop-blur-sm"
            onClick={() => !isLoading && setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border border-space-700/50 bg-space-900 shadow-2xl shadow-cosmic-500/10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-space-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cosmic-500/20 to-nebula-500/20">
                  <svg className="h-5 w-5 text-cosmic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-stardust-100">AI Status Report</h2>
                  <p className="text-sm text-stardust-400">{projectName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="rounded-lg p-2 text-stardust-400 transition-colors hover:bg-space-800 hover:text-stardust-100 disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              {error && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  Failed to generate report. Please try again.
                </div>
              )}

              {isLoading && !completion && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-space-700" />
                    <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-cosmic-500" />
                  </div>
                  <p className="mt-4 text-sm text-stardust-400">Analyzing project data...</p>
                  <p className="mt-1 text-xs text-stardust-400/60">This may take a few seconds</p>
                </div>
              )}

              {completion && (
                <div className="prose prose-invert max-w-none">
                  <div className="space-y-4 text-stardust-200">
                    {completion.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return (
                          <h1 key={index} className="text-xl font-bold text-stardust-100">
                            {line.replace('# ', '')}
                          </h1>
                        )
                      }
                      if (line.startsWith('## ')) {
                        return (
                          <h2 key={index} className="mt-6 text-lg font-semibold text-stardust-100">
                            {line.replace('## ', '')}
                          </h2>
                        )
                      }
                      if (line.startsWith('### ')) {
                        return (
                          <h3 key={index} className="mt-4 font-medium text-stardust-100">
                            {line.replace('### ', '')}
                          </h3>
                        )
                      }
                      if (line.startsWith('- ')) {
                        return (
                          <li key={index} className="ml-4 text-stardust-200">
                            {line.replace('- ', '')}
                          </li>
                        )
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={index} className="font-semibold text-stardust-100">
                            {line.replace(/\*\*/g, '')}
                          </p>
                        )
                      }
                      if (line.trim() === '') {
                        return <br key={index} />
                      }
                      return (
                        <p key={index} className="text-stardust-200">
                          {line}
                        </p>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {completion && (
              <div className="border-t border-space-700/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-stardust-400">
                    Generated by AI • Based on current project data
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerateReport()}
                      disabled={isLoading}
                      className="rounded-lg border border-space-700 bg-space-800 px-3 py-1.5 text-sm text-stardust-100 transition-colors hover:bg-space-700 disabled:opacity-50"
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(completion)}
                      className="rounded-lg border border-space-700 bg-space-800 px-3 py-1.5 text-sm text-stardust-100 transition-colors hover:bg-space-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
