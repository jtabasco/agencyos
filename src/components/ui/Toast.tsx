import { useEffect, useState } from 'react'

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  onDismiss: () => void
}

export function Toast({ type, message, onDismiss }: ToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 2.5 // 100% / 4000ms * interval = 2.5% per 50ms
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
          iconColor: 'text-emerald-400',
          borderColor: 'border-l-4 border-l-emerald-500',
        }
      case 'error':
        return {
          icon: (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          iconColor: 'text-red-400',
          borderColor: 'border-l-4 border-l-red-500',
        }
      case 'warning':
        return {
          icon: (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0 0v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          iconColor: 'text-amber-400',
          borderColor: 'border-l-4 border-l-amber-500',
        }
      case 'info':
        return {
          icon: (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          iconColor: 'text-cosmic-300',
          borderColor: 'border-l-4 border-l-cosmic-500',
        }
    }
  }

  const { icon, iconColor, borderColor } = getIconAndColor()

  return (
    <div
      className={`
        w-full max-w-sm rounded-2xl border border-space-700/60
        bg-space-800/70 backdrop-blur-xl shadow-2xl shadow-space-950/50
        overflow-hidden ${borderColor}
      `}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stardust-100 line-clamp-3">
            {message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="ml-2 flex-shrink-0 text-stardust-400 hover:text-stardust-200 transition-colors"
          aria-label="Dismiss notification"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-space-700/30">
        <div
          className={`h-full transition-all ease-linear`}
          style={{
            width: `${progress}%`,
            background:
              type === 'success'
                ? '#10b981'
                : type === 'error'
                  ? '#ef4444'
                  : type === 'warning'
                    ? '#f59e0b'
                    : '#7c3aed',
          }}
        />
      </div>
    </div>
  )
}
