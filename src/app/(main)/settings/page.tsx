'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types/database'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences'>('profile')

  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [notifications, setNotifications] = useState({
    email_projects: true,
    email_tasks: true,
    email_updates: false,
    push_enabled: true,
  })

  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setProfile(data)
          setFullName(data.full_name || '')
          setEmail(data.email || '')
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, full_name: fullName })
    }

    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cosmic-500 border-t-transparent" />
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'notifications', label: 'Notifications', icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )},
    { id: 'security', label: 'Security', icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )},
    { id: 'preferences', label: 'Preferences', icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    )},
  ]

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stardust-100">Settings</h1>
        <p className="mt-1 text-stardust-400">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cosmic-500/20 to-nebula-500/20 text-stardust-100'
                    : 'text-stardust-400 hover:bg-space-800/50 hover:text-stardust-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="rounded-2xl border border-space-700/50 bg-space-800/50 backdrop-blur-sm">
              <div className="border-b border-space-700/50 px-6 py-4">
                <h2 className="text-lg font-semibold text-stardust-100">Profile Information</h2>
                <p className="text-sm text-stardust-400">Update your personal details</p>
              </div>
              <div className="space-y-6 p-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-2xl font-bold text-white">
                    {fullName?.charAt(0) || email?.charAt(0) || '?'}
                  </div>
                  <div>
                    <button className="rounded-xl border border-space-700 bg-space-800 px-4 py-2 text-sm font-medium text-stardust-100 transition-colors hover:bg-space-700">
                      Change Avatar
                    </button>
                    <p className="mt-2 text-xs text-stardust-400">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-stardust-200">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-space-700 bg-space-800 px-4 py-3 text-stardust-100 placeholder-stardust-400 focus:border-cosmic-500 focus:outline-none"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stardust-200">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled
                    className="mt-2 block w-full rounded-xl border border-space-700 bg-space-900 px-4 py-3 text-stardust-400"
                  />
                  <p className="mt-1 text-xs text-stardust-400">Email cannot be changed</p>
                </div>

                <div className="flex justify-end border-t border-space-700/50 pt-6">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cosmic-500/25 transition-all hover:shadow-cosmic-500/40 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="rounded-2xl border border-space-700/50 bg-space-800/50 backdrop-blur-sm">
              <div className="border-b border-space-700/50 px-6 py-4">
                <h2 className="text-lg font-semibold text-stardust-100">Notification Preferences</h2>
                <p className="text-sm text-stardust-400">Manage how you receive notifications</p>
              </div>
              <div className="divide-y divide-space-700/50">
                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-stardust-100">Project Updates</p>
                    <p className="text-sm text-stardust-400">Receive emails about project status changes</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, email_projects: !prev.email_projects }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email_projects ? 'bg-cosmic-500' : 'bg-space-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.email_projects ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-stardust-100">Task Assignments</p>
                    <p className="text-sm text-stardust-400">Get notified when tasks are assigned to you</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, email_tasks: !prev.email_tasks }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email_tasks ? 'bg-cosmic-500' : 'bg-space-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.email_tasks ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-stardust-100">Weekly Digest</p>
                    <p className="text-sm text-stardust-400">Receive a weekly summary of all updates</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, email_updates: !prev.email_updates }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email_updates ? 'bg-cosmic-500' : 'bg-space-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.email_updates ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-stardust-100">Push Notifications</p>
                    <p className="text-sm text-stardust-400">Enable browser push notifications</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, push_enabled: !prev.push_enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.push_enabled ? 'bg-cosmic-500' : 'bg-space-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.push_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-space-700/50 bg-space-800/50 backdrop-blur-sm">
                <div className="border-b border-space-700/50 px-6 py-4">
                  <h2 className="text-lg font-semibold text-stardust-100">Password</h2>
                  <p className="text-sm text-stardust-400">Update your password to keep your account secure</p>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <label className="block text-sm font-medium text-stardust-200">Current Password</label>
                    <input
                      type="password"
                      className="mt-2 block w-full rounded-xl border border-space-700 bg-space-800 px-4 py-3 text-stardust-100 placeholder-stardust-400 focus:border-cosmic-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stardust-200">New Password</label>
                    <input
                      type="password"
                      className="mt-2 block w-full rounded-xl border border-space-700 bg-space-800 px-4 py-3 text-stardust-100 placeholder-stardust-400 focus:border-cosmic-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stardust-200">Confirm New Password</label>
                    <input
                      type="password"
                      className="mt-2 block w-full rounded-xl border border-space-700 bg-space-800 px-4 py-3 text-stardust-100 placeholder-stardust-400 focus:border-cosmic-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <button className="rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cosmic-500/25 transition-all hover:shadow-cosmic-500/40">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-red-500/30 bg-red-500/5 backdrop-blur-sm">
                <div className="border-b border-red-500/30 px-6 py-4">
                  <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
                </div>
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium text-stardust-100">Sign Out</p>
                    <p className="text-sm text-stardust-400">Sign out of your account on this device</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="rounded-2xl border border-space-700/50 bg-space-800/50 backdrop-blur-sm">
              <div className="border-b border-space-700/50 px-6 py-4">
                <h2 className="text-lg font-semibold text-stardust-100">Application Preferences</h2>
                <p className="text-sm text-stardust-400">Customize your AgencyOS experience</p>
              </div>
              <div className="divide-y divide-space-700/50">
                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-stardust-100">Theme</p>
                    <p className="text-sm text-stardust-400">Choose your preferred color scheme</p>
                  </div>
                  <select className="rounded-lg border border-space-700 bg-space-800 px-4 py-2 text-sm text-stardust-100 focus:border-cosmic-500 focus:outline-none">
                    <option value="dark">Dark (Default)</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-stardust-100">Language</p>
                    <p className="text-sm text-stardust-400">Select your preferred language</p>
                  </div>
                  <select className="rounded-lg border border-space-700 bg-space-800 px-4 py-2 text-sm text-stardust-100 focus:border-cosmic-500 focus:outline-none">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-stardust-100">Timezone</p>
                    <p className="text-sm text-stardust-400">Set your local timezone for accurate dates</p>
                  </div>
                  <select className="rounded-lg border border-space-700 bg-space-800 px-4 py-2 text-sm text-stardust-100 focus:border-cosmic-500 focus:outline-none">
                    <option value="utc">UTC</option>
                    <option value="est">Eastern Time (ET)</option>
                    <option value="pst">Pacific Time (PT)</option>
                    <option value="cst">Central Time (CT)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
