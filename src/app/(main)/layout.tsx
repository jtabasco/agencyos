import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MainLayoutClient } from '@/components/layout/MainLayoutClient'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Default to client role if profile doesn't exist
  const userRole = profile?.role || 'client'

  return (
    <div className="min-h-screen bg-space-950">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-mesh-aurora opacity-30 pointer-events-none" />

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar userRole={userRole} />
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header profile={profile} />

        {/* Main content */}
        <main className="relative z-10 min-h-[calc(100vh-4rem)]">
          <MainLayoutClient>
            {children}
          </MainLayoutClient>
        </main>
      </div>
    </div>
  )
}
