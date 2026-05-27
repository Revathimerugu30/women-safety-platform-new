'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  FiShield, 
  FiHome, 
  FiAlertCircle, 
  FiMap, 
  FiUser,
  FiBell,
  FiLogOut,
  FiMenu,
  FiX,
  FiToggleRight
} from 'react-icons/fi'
import { useState } from 'react'
import { useAuthStore, useEmergencyStore, useNotificationStore } from '@/lib/store'
import { useRealtimeEvents } from '@/hooks/use-realtime-events'
import { syncCurrentUserWithAdmin } from '@/lib/admin-sync-client'
import { NotificationCenter } from '@/components/notification/notification-center'

const volunteerNavItems = [
  { href: '/dashboard/volunteer', icon: FiHome, label: 'Dashboard' },
  { href: '/dashboard/volunteer/requests', icon: FiAlertCircle, label: 'Requests' },
  { href: '/dashboard/volunteer/map', icon: FiMap, label: 'Live Map' },
  { href: '/dashboard/volunteer/profile', icon: FiUser, label: 'Profile' },
]

export default function VolunteerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, logout, updateUser } = useAuthStore()
  const { alerts, addAlert, updateAlert } = useEmergencyStore()
  const { addNotification } = useNotificationStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const loadEmergencies = async () => {
      try {
        const response = await fetch('/api/admin/emergencies')
        const data = await response.json().catch(() => null)
        if (response.ok && Array.isArray(data?.emergencies)) {
          data.emergencies.forEach((alert: any) => addAlert(alert))
        }
      } catch (error) {
        console.warn('Unable to load emergencies for volunteer:', error)
      }
    }

    loadEmergencies()
  }, [addAlert])

  useRealtimeEvents((event) => {
    if (!event.data?.alert) {
      return
    }

    if (event.type === 'sos-triggered') {
      const alert = event.data.alert
      const alertExists = alerts.some((existingAlert) => existingAlert.id === alert.id)
      if (alertExists) {
        updateAlert(alert.id, alert)
      } else {
        addAlert(alert)
      }
      addNotification({
        title: 'New Emergency Request',
        message: `${alert.userName} needs help nearby.`,
        type: 'emergency',
      })
      toast.error('New emergency request received')
      return
    }

    if (['sos-updated', 'sos-cancelled'].includes(event.type)) {
      addAlert(event.data.alert)
    }
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'volunteer') {
      router.push('/auth/login')
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'volunteer') {
      syncCurrentUserWithAdmin(user)
      const interval = setInterval(() => syncCurrentUserWithAdmin(user), 5000)

      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const toggleAvailability = () => {
    updateUser({ availability: !user?.availability })
  }

  if (!isAuthenticated || user?.role !== 'volunteer') {
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
            <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
              <FiShield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">SafeHer</span>
          </Link>
        </div>

        {/* Availability toggle */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-2">
              <FiToggleRight className={`w-5 h-5 ${user?.availability ? 'text-success' : 'text-muted-foreground'}`} />
              <span className="text-sm font-medium">
                {user?.availability ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <button
              onClick={toggleAvailability}
              className={`w-12 h-6 rounded-full transition-all ${
                user?.availability ? 'bg-success' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  user?.availability ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {volunteerNavItems.map((item) => (
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
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Volunteer</p>
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
            <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
              <FiShield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">SafeHer</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)}>
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <span className="text-sm font-medium">
              {user?.availability ? 'Available' : 'Unavailable'}
            </span>
            <button
              onClick={toggleAvailability}
              className={`w-12 h-6 rounded-full transition-all ${
                user?.availability ? 'bg-success' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  user?.availability ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {volunteerNavItems.map((item) => (
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
            <NotificationCenter />
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
          <ul className="flex items-center justify-around">
            {volunteerNavItems.map((item) => (
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
