'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  FiAlertCircle, 
  FiCheckCircle, 
  FiClock, 
  FiMapPin,
  FiArrowRight,
  FiNavigation
} from 'react-icons/fi'
import { useAuthStore, useEmergencyStore } from '@/lib/store'

export default function VolunteerDashboardPage() {
  const { user } = useAuthStore()
  const { alerts } = useEmergencyStore()

  const pendingAlerts = alerts.filter((a) => a.status === 'pending')
  const myActiveAlerts = alerts.filter(
    (a) => a.assignedVolunteerId === user?.id && ['accepted', 'on_the_way', 'reached'].includes(a.status)
  )
  const completedAlerts = alerts.filter(
    (a) => a.assignedVolunteerId === user?.id && a.status === 'completed'
  )

  const stats = [
    { label: 'Pending Alerts', value: pendingAlerts.length.toString(), icon: FiAlertCircle, color: 'text-primary' },
    { label: 'Active Response', value: myActiveAlerts.length.toString(), icon: FiNavigation, color: 'text-blue-400' },
    { label: 'Completed', value: completedAlerts.length.toString(), icon: FiCheckCircle, color: 'text-success' },
    { label: 'Response Time', value: '0 min', icon: FiClock, color: 'text-purple-400' },
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
          Welcome, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          {user?.availability
            ? 'You are available to respond to emergencies'
            : 'You are currently unavailable'}
        </p>
      </motion.div>

      {/* Availability status banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`glass-card rounded-xl p-4 border-l-4 ${
          user?.availability ? 'border-success' : 'border-yellow-500'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${user?.availability ? 'bg-success animate-pulse' : 'bg-yellow-500'}`} />
          <span className="font-medium">
            {user?.availability
              ? 'You will receive emergency alerts'
              : 'Enable availability to receive alerts'}
          </span>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
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

      {/* Active Response */}
      {myActiveAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card rounded-xl p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Active Response
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                You are currently responding to an emergency
              </p>
            </div>
            <Link
              href="/dashboard/volunteer/requests"
              className="text-sm text-blue-400 hover:underline flex items-center gap-1"
            >
              View Details <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {myActiveAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium">{alert.userName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <FiMapPin className="w-4 h-4" />
                  {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium">
                {alert.status.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Nearby Emergencies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Nearby Emergency Requests</h3>
          <Link href="/dashboard/volunteer/requests" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>

        {pendingAlerts.length === 0 ? (
          <div className="text-center py-8">
            <FiCheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <p className="font-medium">No pending emergencies</p>
            <p className="text-sm text-muted-foreground">All clear in your area</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FiAlertCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{alert.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      ~0.5 km away
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/volunteer/requests"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all"
                >
                  Respond
                </Link>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
