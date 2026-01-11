'use client'

import { signout } from '@/actions/auth'
import type { Profile } from '@/types/database'

interface HeaderProps {
  profile: Profile | null
  onMenuToggle?: () => void
}

export function Header({ profile, onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-space-800/50 bg-space-900/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Menu toggle for mobile */}
        <div className="flex items-center gap-4">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="rounded-lg p-2 text-stardust-400 transition-colors hover:bg-space-800 hover:text-stardust-100 lg:hidden"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Search */}
          <div className="hidden sm:block">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stardust-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search projects, tasks..."
                className="w-64 rounded-xl border border-space-700/50 bg-space-800/50 py-2 pl-10 pr-4 text-sm text-stardust-100 placeholder-stardust-400 transition-all focus:border-cosmic-500 focus:outline-none focus:ring-1 focus:ring-cosmic-500 lg:w-80"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-stardust-400 transition-colors hover:bg-space-800 hover:text-stardust-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cosmic-400" />
          </button>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-stardust-100">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-stardust-400 capitalize">
                {profile?.role || 'client'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-sm font-bold text-white">
              {profile?.full_name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <form action={signout}>
              <button
                type="submit"
                className="rounded-lg p-2 text-stardust-400 transition-colors hover:bg-space-800 hover:text-stardust-100"
                title="Sign out"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
