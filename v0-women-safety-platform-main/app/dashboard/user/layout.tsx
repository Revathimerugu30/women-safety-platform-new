'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FiShield, 
  FiHome, 
  FiAlertCircle, 
  FiClock, 
  FiUsers, 
  FiUser,
  FiBell,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi'
import { useState } from 'react'
import { useAuthStore, useEmergencyStore } from '@/lib/store'
import { useRealtimeEvents } from '@/hooks/use-realtime-events'
import { syncCurrentUserWithAdmin } from '@/lib/admin-sync-client'
import { NotificationCenter } from '@/components/notification/notification-center'

const userNavItems = [
  { href: '/dashboard/user', icon: FiHome, label: 'Dashboard' },
  { href: '/dashboard/user/sos', icon: FiAlertCircle, label: 'SOS' },
  { href: '/dashboard/user/history', icon: FiClock, label: 'History' },
  { href: '/dashboard/user/contacts', icon: FiUsers, label: 'Contacts' },
  { href: '/dashboard/user/profile', icon: FiUser, label: 'Profile' },
]

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const alerts = useEmergencyStore((state) => state.alerts)
  const addAlert = useEmergencyStore((state) => state.addAlert)
  const updateAlert = useEmergencyStore((state) => state.updateAlert)
  const setCurrentAlert = useEmergencyStore((state) => state.setCurrentAlert)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const userId = user?.id ?? null

  useRealtimeEvents((event) => {
    if (!event.data?.alert || !user?.id) {
      return
    }

    const alert = event.data.alert
    if (alert.userId !== user.id) {
      return
    }

    if (event.type === 'sos-triggered') {
      const alertExists = alerts.some((existingAlert) => existingAlert.id === alert.id)
      if (alertExists) {
        updateAlert(alert.id, alert)
      } else {
        addAlert(alert)
      }
      setCurrentAlert(alert)
      return
    }

    if (['sos-updated', 'sos-cancelled'].includes(event.type)) {
      const alertExists = alerts.some((existingAlert) => existingAlert.id === alert.id)
      if (alertExists) {
        updateAlert(alert.id, alert)
      } else {
        addAlert(alert)
      }

      setCurrentAlert(event.type === 'sos-cancelled' ? null : alert)
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'user')) {
      router.push('/auth/login')
    }
  }, [mounted, isAuthenticated, user, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'user') {
      syncCurrentUserWithAdmin(user)
      const interval = setInterval(() => syncCurrentUserWithAdmin(user), 5000)

      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!userId) return

    const loadUserAlerts = async () => {
      try {
        const response = await fetch('/api/admin/emergencies')
        const data = await response.json().catch(() => null)

        if (!response.ok || !Array.isArray(data?.emergencies)) {
          return
        }

        data.emergencies.forEach((alert: any) => {
          if (alert.userId !== userId) return

          addAlert(alert)

          if (['pending', 'accepted', 'on_the_way', 'reached'].includes(alert.status)) {
            setCurrentAlert(alert)
          } else if (alert.status === 'cancelled') {
            setCurrentAlert(null)
          }
        })
      } catch (error) {
        console.warn('Unable to refresh user emergency alerts:', error)
      }
    }

    loadUserAlerts()
    const interval = setInterval(loadUserAlerts, 8000)
    return () => clearInterval(interval)
  }, [userId])

  const activeAlert = alerts.find((alert) =>
    alert.userId === user?.id && ['pending', 'accepted', 'on_the_way', 'reached'].includes(alert.status)
  )

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated || user?.role !== 'user') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FiShield className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SafeHer</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {userNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
          >
            <FiLogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FiShield className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SafeHer</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)}>
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {userNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"
          >
            <FiLogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-foreground"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-4">
            {activeAlert && (
              <div className="hidden md:flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                <span className="font-semibold">SOS Active</span>
                <span className="text-muted-foreground">
                  {activeAlert.assignedVolunteerName
                    ? `${activeAlert.assignedVolunteerName} • ${activeAlert.status.replace(/_/g, ' ')}`
                    : activeAlert.status.replace(/_/g, ' ')}
                </span>
              </div>
            )}
            <NotificationCenter />
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {!mounted ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mx-auto" />
                <p className="text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>

        {/* Mobile bottom navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
          <ul className="flex items-center justify-around">
            {userNavItems.slice(0, 5).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex flex-col items-center gap-1 py-3 px-4 text-muted-foreground hover:text-foreground transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
