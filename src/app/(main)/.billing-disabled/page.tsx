'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Invoice {
  id: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  date: string
  project: string
}

const mockInvoices: Invoice[] = [
  { id: 'INV-001', amount: 5000, status: 'paid', date: '2024-01-15', project: 'Website Redesign' },
  { id: 'INV-002', amount: 3500, status: 'pending', date: '2024-01-20', project: 'Mobile App Development' },
  { id: 'INV-003', amount: 2000, status: 'paid', date: '2024-01-10', project: 'Brand Identity' },
]

const statusColors = {
  paid: 'bg-emerald-500/20 text-emerald-400',
  pending: 'bg-amber-500/20 text-amber-400',
  overdue: 'bg-red-500/20 text-red-400',
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro')
  const [invoices] = useState<Invoice[]>(mockInvoices)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cosmic-500 border-t-transparent" />
      </div>
    )
  }

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stardust-100">Billing & Invoices</h1>
        <p className="mt-1 text-stardust-400">Manage your subscription and view invoices</p>
      </div>

      {/* Plan Overview */}
      <div className="rounded-2xl border border-space-700/50 bg-gradient-to-br from-cosmic-500/10 to-nebula-500/10 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500 px-3 py-1 text-xs font-medium text-white">
                {plan.toUpperCase()} PLAN
              </span>
              <span className="text-sm text-stardust-400">Current plan</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-stardust-100">
              ${plan === 'starter' ? '29' : plan === 'pro' ? '99' : '299'}
              <span className="text-lg font-normal text-stardust-400">/month</span>
            </p>
            <p className="mt-1 text-sm text-stardust-400">
              Next billing date: February 1, 2024
            </p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl border border-space-700 bg-space-800 px-5 py-2.5 text-sm font-medium text-stardust-100 transition-colors hover:bg-space-700">
              Change Plan
            </button>
            <button className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-space-700/50 bg-space-800/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-stardust-400">Total Revenue</p>
              <p className="text-2xl font-bold text-stardust-100">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-space-700/50 bg-space-800/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-stardust-400">Pending</p>
              <p className="text-2xl font-bold text-stardust-100">${pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-space-700/50 bg-space-800/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-500 shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-stardust-400">Total Invoices</p>
              <p className="text-2xl font-bold text-stardust-100">{invoices.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-2xl border border-space-700/50 bg-space-800/50 backdrop-blur-sm">
        <div className="border-b border-space-700/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-stardust-100">Payment Method</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between rounded-xl border border-space-700 bg-space-900 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                <span className="text-sm font-bold text-white">VISA</span>
              </div>
              <div>
                <p className="font-medium text-stardust-100">•••• •••• •••• 4242</p>
                <p className="text-sm text-stardust-400">Expires 12/2025</p>
              </div>
            </div>
            <button className="rounded-lg border border-space-700 bg-space-800 px-4 py-2 text-sm font-medium text-stardust-100 transition-colors hover:bg-space-700">
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-2xl border border-space-700/50 bg-space-800/50 backdrop-blur-sm">
        <div className="border-b border-space-700/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-stardust-100">Recent Invoices</h2>
        </div>
        <div className="divide-y divide-space-700/50">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-space-700">
                  <svg className="h-5 w-5 text-stardust-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-stardust-100">{invoice.id}</p>
                  <p className="text-sm text-stardust-400">{invoice.project} • {invoice.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[invoice.status]}`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
                <span className="font-medium text-stardust-100">${invoice.amount.toLocaleString()}</span>
                <button className="rounded-lg p-2 text-stardust-400 transition-colors hover:bg-space-700 hover:text-stardust-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
