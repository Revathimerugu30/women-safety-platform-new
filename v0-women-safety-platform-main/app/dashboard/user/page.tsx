'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  FiAlertCircle, 
  FiMapPin, 
  FiClock, 
  FiUsers, 
  FiShield,
  FiArrowRight,
  FiCheckCircle,
  FiX,
} from 'react-icons/fi'
import { useAuthStore, useEmergencyStore } from '@/lib/store'

export default function UserDashboardPage() {
  const { user } = useAuthStore()
  const { alerts, addAlert } = useEmergencyStore()

  const userAlerts = alerts.filter((a) => a.userId === user?.id)
  const activeAlerts = userAlerts.filter((a) =>
    ['pending', 'accepted', 'on_the_way'].includes(a.status)
  )
  const activeAlert = activeAlerts.reduce((latest, alert) => {
    if (!latest) return alert
    return new Date(alert.updatedAt).getTime() > new Date(latest.updatedAt).getTime() ? alert : latest
  }, activeAlerts[0] || null)
  const solvedAlerts = userAlerts.filter(
    (a) => ['reached', 'completed'].includes(a.status)
  )
  const cancelledAlerts = userAlerts.filter((a) => a.status === 'cancelled')
  const latestResolvedAlert = userAlerts
    .filter((a) => ['reached', 'completed'].includes(a.status))
    .reduce((latest, alert) => {
      if (!latest) return alert
      return new Date(alert.updatedAt).getTime() > new Date(latest.updatedAt).getTime() ? alert : latest
    }, null as typeof userAlerts[number] | null)

  const statusCounts = {
    pending: userAlerts.filter((a) => a.status === 'pending').length,
    accepted: userAlerts.filter((a) => a.status === 'accepted').length,
    on_the_way: userAlerts.filter((a) => a.status === 'on_the_way').length,
    reached: userAlerts.filter((a) => a.status === 'reached').length,
  }

  useEffect(() => {
    if (!user) return

    const loadUserAlerts = async () => {
      try {
        const response = await fetch('/api/admin/emergencies')
        const data = await response.json().catch(() => null)

        if (!response.ok || !Array.isArray(data?.emergencies)) {
          return
        }

        data.emergencies.forEach((alert: any) => {
          if (alert.userId === user.id) {
            addAlert(alert)
          }
        })
      } catch (error) {
        console.warn('Unable to load user emergencies:', error)
      }
    }

    loadUserAlerts()
  }, [user, addAlert])

  const stats = [
    { label: 'Active Alerts', value: activeAlerts.length.toString(), icon: FiAlertCircle, color: 'text-primary' },
    { label: 'Total Alerts', value: userAlerts.length.toString(), icon: FiClock, color: 'text-blue-400' },
    { label: 'Solved Alerts', value: solvedAlerts.length.toString(), icon: FiCheckCircle, color: 'text-success' },
    { label: 'Cancelled Alerts', value: cancelledAlerts.length.toString(), icon: FiX, color: 'text-orange-400' },
    { label: 'Nearby Volunteers', value: '0', icon: FiUsers, color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Your safety dashboard is ready. Stay safe!
        </p>
      </motion.div>

      {/* Emergency SOS Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card rounded-2xl p-6 md:p-8 text-center"
      >
        <h2 className="text-lg font-semibold mb-4">Emergency Assistance</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Press the SOS button in case of emergency. Help will be dispatched to your location immediately.
        </p>
        <Link href="/dashboard/user/sos">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-primary to-red-600 text-white font-bold text-2xl md:text-3xl shadow-lg glow-red sos-pulse mx-auto flex flex-col items-center justify-center gap-2"
          >
            <FiAlertCircle className="w-12 h-12 md:w-16 md:h-16" />
            SOS
          </motion.button>
        </Link>
        <p className="text-xs text-muted-foreground mt-4">
          Tap for emergency assistance
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Emergency tracking counts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Pending', value: statusCounts.pending, color: 'text-yellow-400' },
          { label: 'Accepted', value: statusCounts.accepted, color: 'text-blue-400' },
          { label: 'On The Way', value: statusCounts.on_the_way, color: 'text-purple-400' },
          { label: 'Reached', value: statusCounts.reached, color: 'text-success' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Active Alert Status */}
      {activeAlert && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card rounded-xl p-6 border-l-4 border-primary"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Active Emergency
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Status: <span className="capitalize text-primary">{activeAlert.status.replace(/_/g, ' ')}</span>
              </p>
            </div>
            <Link
              href="/dashboard/user/sos"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View Details <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {activeAlert.assignedVolunteerName && (
            <p className="text-sm mb-4">
              Volunteer <span className="font-medium">{activeAlert.assignedVolunteerName}</span> is responding
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mb-2">Active</p>
              <p className="text-2xl font-semibold text-primary">{activeAlerts.length}</p>
            </div>
            <div className="rounded-xl border border-success/10 bg-success/5 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mb-2">Cancelled</p>
              <p className="text-2xl font-semibold text-success">{cancelledAlerts.length}</p>
            </div>
          </div>
        </motion.div>
      )}

      {!activeAlert && latestResolvedAlert && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="glass-card rounded-xl p-6 border-l-4 border-success"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                Emergency Resolved
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Status: <span className="capitalize text-success">{latestResolvedAlert.status.replace(/_/g, ' ')}</span>
              </p>
            </div>
            <Link
              href="/dashboard/user/sos"
              className="text-sm text-success hover:underline flex items-center gap-1"
            >
              View Details <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-sm text-success font-medium">
            ✅ You are safe. Emergency resolved successfully.
          </p>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <Link href="/dashboard/user/sos" className="block">
          <div className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all group">
            <FiMapPin className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">Share Location</h3>
            <p className="text-sm text-muted-foreground">Share your live location with contacts</p>
          </div>
        </Link>
        <Link href="/dashboard/user/contacts" className="block">
          <div className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all group">
            <FiUsers className="w-8 h-8 text-success mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">Emergency Contacts</h3>
            <p className="text-sm text-muted-foreground">Manage your trusted contacts</p>
          </div>
        </Link>
        <Link href="/dashboard/user/history" className="block">
          <div className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all group">
            <FiShield className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold mb-1">Safety Zones</h3>
            <p className="text-sm text-muted-foreground">View nearby safe locations</p>
          </div>
        </Link>
      </motion.div>
    </div>
  )
}
