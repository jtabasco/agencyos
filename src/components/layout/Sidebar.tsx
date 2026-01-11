'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserRole, ROLE_PERMISSIONS } from '@/types/database'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    roles: ['owner', 'pm', 'dev', 'client'],
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    roles: ['owner', 'pm', 'dev', 'client'],
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    roles: ['owner', 'pm', 'dev'],
  },
  {
    name: 'Team',
    href: '/team',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    roles: ['owner', 'pm'],
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    roles: ['owner'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    roles: ['owner', 'pm'],
  },
]

interface SidebarProps {
  userRole: UserRole
  isCollapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ userRole, isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole))

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    owner: { label: 'Owner', color: 'bg-gradient-to-r from-amber-500 to-orange-500' },
    pm: { label: 'PM', color: 'bg-gradient-to-r from-cosmic-500 to-nebula-500' },
    dev: { label: 'Developer', color: 'bg-gradient-to-r from-emerald-500 to-teal-500' },
    client: { label: 'Client', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen border-r border-space-800/50 bg-space-900/80 backdrop-blur-xl transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-space-800/50 px-4">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-500 shadow-lg shadow-cosmic-500/20">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-stardust-100">AgencyOS</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-500 shadow-lg shadow-cosmic-500/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          )}
          {onToggle && (
            <button
              onClick={onToggle}
              className="rounded-lg p-1.5 text-stardust-400 transition-colors hover:bg-space-800 hover:text-stardust-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
              </svg>
            </button>
          )}
        </div>

        {/* Role Badge */}
        {!isCollapsed && (
          <div className="border-b border-space-800/50 px-4 py-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white ${roleLabels[userRole].color}`}>
              {roleLabels[userRole].label}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cosmic-500/20 to-nebula-500/20 text-stardust-100 shadow-lg shadow-cosmic-500/10'
                    : 'text-stardust-400 hover:bg-space-800/50 hover:text-stardust-100'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <span className={isActive ? 'text-cosmic-400' : 'text-stardust-400 group-hover:text-stardust-100'}>
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.name}</span>}
                {isActive && !isCollapsed && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-cosmic-400" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        {!isCollapsed && (
          <div className="border-t border-space-800/50 p-4">
            <div className="rounded-xl bg-gradient-to-r from-cosmic-500/10 to-nebula-500/10 p-4">
              <p className="text-xs font-medium text-stardust-300">Need help?</p>
              <p className="mt-1 text-xs text-stardust-400">Check our documentation or contact support.</p>
              <button className="mt-3 w-full rounded-lg bg-space-800 px-3 py-2 text-xs font-medium text-stardust-100 transition-colors hover:bg-space-700">
                View Docs
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
