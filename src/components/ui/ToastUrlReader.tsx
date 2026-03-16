'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'

export function ToastUrlReader() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const toastType = searchParams.get('toast')
    const toastMessage = searchParams.get('message')

    if (toastType && toastMessage) {
      toast(
        toastType as 'success' | 'error' | 'info' | 'warning',
        decodeURIComponent(toastMessage)
      )

      // Clean up URL
      const pathname = window.location.pathname
      router.replace(pathname)
    }
  }, [searchParams, toast, router])

  return null
}
