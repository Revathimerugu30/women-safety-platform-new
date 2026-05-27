'use client'

import { motion } from 'framer-motion'
import { FiClock, FiMapPin, FiUser, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { useAuthStore, useEmergencyStore } from '@/lib/store'
import { format } from 'date-fns'

export default function HistoryPage() {
  const { user } = useAuthStore()
  const { alerts } = useEmergencyStore()

  const userAlerts = alerts
    .filter((a) => a.userId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-success" />
      case 'cancelled':
        return <FiAlertCircle className="w-5 h-5 text-orange-400" />
      case 'pending':
        return <FiAlertCircle className="w-5 h-5 text-yellow-400" />
      default:
        return <FiClock className="w-5 h-5 text-blue-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/30'
      case 'cancelled':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Alert History</h1>
        <p className="text-muted-foreground">
          View your past emergency alerts and their status
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{userAlerts.length}</p>
          <p className="text-sm text-muted-foreground">Total Alerts</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {userAlerts.filter((a) => a.status === 'completed').length}
          </p>
          <p className="text-sm text-muted-foreground">Resolved</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">
            {userAlerts.filter((a) => a.status === 'cancelled').length}
          </p>
          <p className="text-sm text-muted-foreground">Cancelled</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {userAlerts.filter((a) => ['pending', 'accepted', 'on_the_way', 'reached'].includes(a.status)).length}
          </p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
      </motion.div>

      {/* Alert list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {userAlerts.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <FiClock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No alerts yet</h3>
            <p className="text-sm text-muted-foreground">
              Your emergency alert history will appear here
            </p>
          </div>
        ) : (
          userAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(alert.status)}
                  <div>
                    <p className="font-semibold">Emergency Alert</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(alert.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(alert.status)}`}>
                  {alert.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FiMapPin className="w-4 h-4" />
                  <span>{alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>
                </div>
                {alert.assignedVolunteerName && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FiUser className="w-4 h-4" />
                    <span>Responded by {alert.assignedVolunteerName}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
