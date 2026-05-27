'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FiAlertCircle, 
  FiMapPin, 
  FiPhone, 
  FiCheck, 
  FiX,
  FiNavigation,
  FiClock
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore, useEmergencyStore, useNotificationStore } from '@/lib/store'
import { useRealtimeEvents } from '@/hooks/use-realtime-events'
import { format } from 'date-fns'

export default function RequestsPage() {
  const { user } = useAuthStore()
  const { alerts, updateAlert, addAlert } = useEmergencyStore()
  const { addNotification } = useNotificationStore()

  const pendingAlerts = alerts.filter((a) => a.status === 'pending')
  const myActiveAlerts = alerts.filter(
    (a) => a.assignedVolunteerId === user?.id && ['accepted', 'on_the_way', 'reached'].includes(a.status)
  )
  const activeAssignment = myActiveAlerts[0] || null

  const handleAccept = async (alertId: string) => {
    const alert = alerts.find((item) => item.id === alertId)
    if (!alert || !user) return

    try {
      const response = await fetch('/api/admin/emergency/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId,
          status: 'accepted',
          assignedVolunteerId: user.id,
          assignedVolunteerName: user.name,
          userId: alert.userId,
          userName: alert.userName,
          userPhone: alert.userPhone,
        }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        toast.error(result?.error || 'Failed to accept emergency')
        return
      }

      if (result.alert) {
        updateAlert(result.alert.id, result.alert)
      }
      addNotification({
        title: 'Alert Accepted',
        message: 'You have accepted an emergency request.',
        type: 'success',
      })
      toast.success('Emergency accepted! Navigate to the location.')
    } catch (error) {
      toast.error('Failed to accept emergency')
    }
  }

  const handleUpdateStatus = async (alertId: string, status: 'on_the_way' | 'reached' | 'completed') => {
    const alert = alerts.find((item) => item.id === alertId)
    if (!alert) return

    try {
      const response = await fetch('/api/admin/emergency/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId,
          status,
          assignedVolunteerId: user?.id,
          assignedVolunteerName: user?.name,
          userId: alert.userId,
          userName: alert.userName,
          userPhone: alert.userPhone,
        }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        toast.error(result?.error || 'Failed to update emergency status')
        return
      }

      if (result.alert) {
        updateAlert(result.alert.id, result.alert)
      }
      const statusMessages = {
        on_the_way: 'Status updated: On the way',
        reached: 'Status updated: Reached location',
        completed: 'Emergency resolved successfully!',
      }
      toast.success(statusMessages[status])
    } catch (error) {
      toast.error('Failed to update emergency status')
    }
  }

  useEffect(() => {
    const loadEmergencies = async () => {
      try {
        const response = await fetch('/api/admin/emergencies')
        const data = await response.json().catch(() => null)
        if (response.ok && Array.isArray(data?.emergencies)) {
          data.emergencies.forEach((alert: any) => addAlert(alert))
        }
      } catch (error) {
        console.warn('Unable to load emergencies:', error)
      }
    }

    loadEmergencies()
  }, [addAlert])

  useRealtimeEvents((event) => {
    if (!event.data?.alert) {
      return
    }

    const alert = event.data.alert
    if (event.type === 'sos-triggered') {
      addAlert(alert)
      return
    }

    if (event.type === 'sos-updated') {
      const alertExists = alerts.some((existingAlert) => existingAlert.id === alert.id)
      if (alertExists) {
        updateAlert(alert.id, alert)
      } else {
        addAlert(alert)
      }

      if (user?.id === alert.assignedVolunteerId) {
        addNotification({
          title: 'Emergency Status Updated',
          message: `${alert.status.replace(/_/g, ' ')} for ${alert.userName}`,
          type: 'info',
        })
      }
    }

    if (event.type === 'sos-cancelled') {
      const alertExists = alerts.some((existingAlert) => existingAlert.id === alert.id)
      if (alertExists) {
        updateAlert(alert.id, alert)
      } else {
        addAlert(alert)
      }
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'accepted':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'on_the_way':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      case 'reached':
        return 'bg-success/10 text-success border-success/30'
      case 'cancelled':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Emergency Requests</h1>
        <p className="text-muted-foreground">
          View and respond to nearby emergency requests
        </p>
      </motion.div>

      {activeAssignment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="glass-card rounded-xl p-6 border-l-4 border-blue-500"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Assignment</p>
              <h2 className="text-xl font-semibold">{activeAssignment.userName}</h2>
              <p className="text-sm text-muted-foreground">
                {activeAssignment.latitude.toFixed(4)}, {activeAssignment.longitude.toFixed(4)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Requested at {format(new Date(activeAssignment.createdAt), 'MMM d, h:mm a')}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(activeAssignment.status)}`}>
                {activeAssignment.status.replace(/_/g, ' ').toUpperCase()}
              </span>
              <p className="text-xs text-muted-foreground mt-2">
                Assigned {activeAssignment.assignedVolunteerName}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* My Active Responses */}
      {myActiveAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FiNavigation className="w-5 h-5 text-blue-400" />
            My Active Responses
          </h2>
          {myActiveAlerts.map((alert) => (
            <div key={alert.id} className="glass-card rounded-xl p-6 border-l-4 border-blue-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{alert.userName}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FiPhone className="w-4 h-4" />
                    {alert.userPhone}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    {format(new Date(alert.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(alert.status)}`}>
                  {alert.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>

              {/* Status update buttons */}
              <div className="flex flex-wrap gap-3">
                {alert.status === 'accepted' && (
                  <button
                    onClick={() => handleUpdateStatus(alert.id, 'on_the_way')}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-500/90 transition-all flex items-center gap-2"
                  >
                    <FiNavigation className="w-4 h-4" />
                    On The Way
                  </button>
                )}
                {alert.status === 'on_the_way' && (
                  <button
                    onClick={() => handleUpdateStatus(alert.id, 'reached')}
                    className="px-4 py-2 bg-success text-white rounded-lg font-medium hover:bg-success/90 transition-all flex items-center gap-2"
                  >
                    <FiMapPin className="w-4 h-4" />
                    Reached Location
                  </button>
                )}
                {alert.status === 'reached' && (
                  <button
                    onClick={() => handleUpdateStatus(alert.id, 'completed')}
                    className="px-4 py-2 bg-success text-white rounded-lg font-medium hover:bg-success/90 transition-all flex items-center gap-2"
                  >
                    <FiCheck className="w-4 h-4" />
                    Mark as Resolved
                  </button>
                )}
                <a
                  href={`tel:${alert.userPhone}`}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all flex items-center gap-2"
                >
                  <FiPhone className="w-4 h-4" />
                  Call User
                </a>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Pending Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FiAlertCircle className="w-5 h-5 text-primary" />
          Pending Requests ({pendingAlerts.length})
        </h2>

        {pendingAlerts.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <FiCheck className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No pending emergencies</h3>
            <p className="text-sm text-muted-foreground">
              {activeAssignment
                ? 'Your assigned emergency is shown above. You will be notified when new requests arrive nearby.'
                : 'You will be notified when there are new requests nearby.'}
            </p>
          </div>
        ) : (
          pendingAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <FiAlertCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{alert.userName}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <FiPhone className="w-4 h-4" />
                      {alert.userPhone}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <FiMapPin className="w-4 h-4" />
                      {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <FiClock className="w-4 h-4" />
                      {format(new Date(alert.createdAt), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAccept(alert.id)}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2"
                  >
                    <FiCheck className="w-5 h-5" />
                    Accept
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
