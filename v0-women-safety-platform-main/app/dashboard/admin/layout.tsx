'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FiShield, 
  FiHome, 
  FiAlertCircle, 
  FiUsers, 
  FiMap,
  FiSettings,
  FiBell,
  FiLogOut,
  FiMenu,
  FiX,
  FiBarChart2
} from 'react-icons/fi'
import { useState } from 'react'
import { useAuthStore, useEmergencyStore } from '@/lib/store'
import { AdminNotificationCenter } from '@/components/admin/notification-center'
import { useRealtimeEvents } from '@/hooks/use-realtime-events'

const adminNavItems = [
  { href: '/dashboard/admin', icon: FiHome, label: 'Dashboard' },
  { href: '/dashboard/admin/emergencies', icon: FiAlertCircle, label: 'Emergencies' },
  { href: '/dashboard/admin/users', icon: FiUsers, label: 'Users' },
  { href: '/dashboard/admin/map', icon: FiMap, label: 'Live Map' },
  { href: '/dashboard/admin/reports', icon: FiBarChart2, label: 'Reports' },
  { href: '/dashboard/admin/settings', icon: FiSettings, label: 'Settings' },
]

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { alerts, addAlert, updateAlert } = useEmergencyStore()
  const [unreadCount, setUnreadCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const loadEmergencies = async () => {
      try {
        const response = await fetch('/api/admin/emergencies')
        const data = await response.json().catch(() => null)
        if (response.ok && Array.isArray(data?.emergencies)) {
          data.emergencies.forEach((alert: any) => addAlert(alert))
        }
      } catch (error) {
        console.warn('Unable to load admin emergencies:', error)
      }
    }

    loadEmergencies()
  }, [addAlert])

  useRealtimeEvents((event) => {
    if (!event.data?.alert) {
      return
    }

    const alert = event.data.alert
    const alertExists = alerts.some((existingAlert) => existingAlert.id === alert.id)

    if (alertExists) {
      updateAlert(alert.id, alert)
    } else {
      addAlert(alert)
    }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/auth/login?role=admin')
    }
  }, [mounted, isAuthenticated, user, router])

  useEffect(() => {
    const handleNotificationCount = (event: CustomEvent<number>) => {
      setUnreadCount(event.detail)
    }

    window.addEventListener(
      'admin-notification-count' as any,
      handleNotificationCount as EventListener
    )

    return () => {
      window.removeEventListener(
        'admin-notification-count' as any,
        handleNotificationCount as EventListener
      )
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const toggleNotifications = () => {
    window.dispatchEvent(new Event('toggle-admin-notifications'))
  }

  if (!isAuthenticated || user?.role !== 'admin') {
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
            <div>
              <span className="text-xl font-bold">SafeHer</span>
              <span className="block text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {adminNavItems.map((item) => (
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

        {/* Admin section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-red-600 rounded-full flex items-center justify-center">
              <FiShield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium">Administrator</p>
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
            {adminNavItems.map((item) => (
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

          <div className="flex-1 lg:flex-none">
            <h2 className="text-lg font-semibold hidden lg:block">Admin Dashboard</h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleNotifications}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open admin notifications"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-red-600 rounded-full flex items-center justify-center">
                <FiShield className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">Admin</span>
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

        <AdminNotificationCenter />
      </div>
    </div>
  )
}
