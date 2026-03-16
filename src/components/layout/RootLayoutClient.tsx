'use client'

import { Suspense } from 'react'
import { ToastProvider } from '@/contexts/ToastContext'
import { ToastUrlReader } from '@/components/ui/ToastUrlReader'

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <ToastUrlReader />
      </Suspense>
      {children}
    </ToastProvider>
  )
}
