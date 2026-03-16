'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { Toast } from '@/components/ui'

interface ToastItem {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  isExiting: boolean
}

interface ToastContextType {
  toast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback(
    (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
      const id = Math.random().toString(36).substring(2, 11)

      // Add toast
      setToasts((prev) => {
        const updated = [...prev, { id, type, message, isExiting: false }]
        // Keep max 5 toasts
        if (updated.length > 5) {
          updated.shift()
        }
        return updated
      })

      // Start exit animation after 4 seconds
      const exitTimer = setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
        )
      }, 4000)

      // Remove after animation completes
      const removeTimer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4300)

      return () => {
        clearTimeout(exitTimer)
        clearTimeout(removeTimer)
      }
    },
    []
  )

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={t.isExiting ? 'animate-toast-exit' : 'animate-toast-enter'}
            style={{ pointerEvents: 'auto' }}
          >
            <Toast
              type={t.type}
              message={t.message}
              onDismiss={() => dismiss(t.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
