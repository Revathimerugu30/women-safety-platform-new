'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  FiAlertCircle, 
  FiMapPin, 
  FiPhone, 
  FiUser,
  FiFilter,
  FiSearch,
  FiEye
} from 'react-icons/fi'
import { useEmergencyStore } from '@/lib/store'
import { useRealtimeEvents } from '@/hooks/use-realtime-events'
import { format } from 'date-fns'

type FilterStatus = 'all' | 'pending' | 'active' | 'completed' | 'cancelled'

export default function AdminEmergenciesPage() {
  const { alerts, updateAlert } = useEmergencyStore()
  const addAlert = useEmergencyStore((state) => state.addAlert)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')

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
    if (
      ['sos-triggered', 'sos-updated', 'sos-cancelled'].includes(event.type) &&
      event.data?.alert
    ) {
      const alert = event.data.alert
      const alertExists = alerts.some((existingAlert) => existingAlert.id === alert.id)
      if (alertExists) {
        updateAlert(alert.id, alert)
      } else {
        addAlert(alert)
      }
    }
  })

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = 
      alert.userName.toLowerCase().includes(search.toLowerCase()) ||
      alert.userPhone.includes(search)
    
    if (filter === 'all') return matchesSearch
    if (filter === 'pending') return matchesSearch && alert.status === 'pending'
    if (filter === 'active') return matchesSearch && ['accepted', 'on_the_way', 'reached'].includes(alert.status)
    if (filter === 'completed') return matchesSearch && alert.status === 'completed'
    if (filter === 'cancelled') return matchesSearch && alert.status === 'cancelled'
    return matchesSearch
  })

  const handleAssignVolunteer = async (alertId: string) => {
    try {
      const response = await fetch('/api/admin/emergency/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId,
          status: 'accepted',
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        toast.error(result?.error || 'Failed to assign volunteer')
        return
      }

      if (result.alert) {
        addAlert(result.alert)
      }

      toast.success('Volunteer assigned and alert handed over')
    } catch (error) {
      toast.error('Failed to assign volunteer')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/30'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'cancelled':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
      case 'accepted':
      case 'on_the_way':
      case 'reached':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      default:
        return 'bg-secondary text-secondary-foreground border-border'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Awaiting volunteer assignment.'
      case 'accepted':
        return 'Volunteer has accepted the request and is preparing to respond.'
      case 'on_the_way':
        return 'Volunteer is on the way to the emergency location.'
      case 'reached':
        return 'Volunteer has reached the location and is assisting the user.'
      case 'completed':
        return 'Emergency resolved successfully.'
      case 'cancelled':
        return 'Emergency request was cancelled.'
      default:
        return 'Status unavailable.'
    }
  }

  const statusCounts = {
    pending: alerts.filter((a) => a.status === 'pending').length,
    accepted: alerts.filter((a) => a.status === 'accepted').length,
    on_the_way: alerts.filter((a) => a.status === 'on_the_way').length,
    reached: alerts.filter((a) => a.status === 'reached').length,
    completed: alerts.filter((a) => a.status === 'completed').length,
  }

  const trackingSteps = [
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'on_the_way', label: 'On The Way' },
    { id: 'reached', label: 'Reached' },
    { id: 'completed', label: 'Completed' },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Emergency Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage all emergency alerts
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full pl-10 pr-4 py-2 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-muted-foreground" />
            {(['all', 'pending', 'active', 'completed', 'cancelled'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  filter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-4 gap-4"
      >
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{alerts.length}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {statusCounts.pending}
          </p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">
            {statusCounts.accepted}
          </p>
          <p className="text-sm text-muted-foreground">Accepted</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {statusCounts.on_the_way}
          </p>
          <p className="text-sm text-muted-foreground">On The Way</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {statusCounts.reached}
          </p>
          <p className="text-sm text-muted-foreground">Reached</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success">
            {statusCounts.completed}
          </p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
      </motion.div>

      {/* Alerts list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {filteredAlerts.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <FiAlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No emergencies found</h3>
            <p className="text-sm text-muted-foreground">
              {search ? 'Try a different search term' : 'No emergencies match the selected filter'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    alert.status === 'pending' ? 'bg-yellow-500/10' :
                    alert.status === 'completed' ? 'bg-success/10' : 'bg-blue-500/10'
                  }`}>
                    <FiAlertCircle className={`w-6 h-6 ${
                      alert.status === 'pending' ? 'text-yellow-400' :
                      alert.status === 'completed' ? 'text-success' : 'text-blue-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{alert.userName}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FiPhone className="w-4 h-4" />
                        {alert.userPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-4 h-4" />
                        {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                      </span>
                      <span>
                        {format(new Date(alert.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {alert.assignedVolunteerName && (
                      <div className="flex flex-col gap-2 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <FiUser className="w-4 h-4 text-success" />
                          <span>Assigned to: <span className="font-medium">{alert.assignedVolunteerName}</span></span>
                        </div>
                        <p className="text-muted-foreground">{getStatusText(alert.status)}</p>
                      </div>
                    )}
                    {!alert.assignedVolunteerName && (
                      <p className="mt-2 text-sm text-muted-foreground">No volunteer assigned yet. This alert is waiting for assignment.</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(alert.status)}`}>
                      {alert.status.replace(/_/g, ' ')}
                    </span>
                    <a
                      href={`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all"
                      aria-label="Open live location"
                    >
                      <FiEye className="w-5 h-5" />
                    </a>
                  </div>
                  {alert.status === 'pending' && (
                    <button
                      onClick={() => handleAssignVolunteer(alert.id)}
                      className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all mt-3 sm:mt-0"
                    >
                      Assign Volunteer
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground mb-3">
                  <span className="font-medium text-foreground">Volunteer Tracking</span>
                  <span className={`rounded-full px-2 py-1 text-xs ${alert.status === 'completed' ? 'bg-success/10 text-success' : alert.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {alert.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="space-y-3">
                  {trackingSteps.map((step) => {
                    const stepOrder = ['pending', 'accepted', 'on_the_way', 'reached', 'completed']
                    const isComplete = stepOrder.indexOf(alert.status) >= stepOrder.indexOf(step.id as any)
                    const isActive = alert.status === step.id
                    return (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${isComplete ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                          {isComplete ? '✓' : step.label.charAt(0)}
                        </div>
                        <div>
                          <span className={isComplete ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                            {step.label}
                          </span>
                          {isActive && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Current step: {getStatusText(alert.status)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
