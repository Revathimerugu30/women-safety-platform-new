'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  FiAlertCircle, 
  FiMapPin, 
  FiPhone,
  FiX,
  FiCheck,
  FiNavigation
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore, useEmergencyStore, useNotificationStore } from '@/lib/store'
import type { LiveLocation } from '@/components/maps/live-location-map'
import { useRealtimeEvents } from '@/hooks/use-realtime-events'

// Dynamic import for the map to avoid SSR issues
const LiveLocationMap = dynamic(() => import('@/components/maps/live-location-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-card rounded-xl animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground">Loading live map...</span>
    </div>
  ),
})

type EmergencyStatus = 'idle' | 'confirming' | 'sending' | 'active'

export default function SOSPage() {
  const { user } = useAuthStore()
  const { alerts, addAlert, updateAlert, setCurrentAlert } = useEmergencyStore()
  const { addNotification } = useNotificationStore()
  
  const [status, setStatus] = useState<EmergencyStatus>('idle')
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null)
  const [countdown, setCountdown] = useState(5)

  // Get user's active or resolved alert
  const userAlerts = alerts.filter((a) => a.userId === user?.id)
  const hasActiveAlert = userAlerts.some((a) => ['pending', 'accepted', 'on_the_way'].includes(a.status))
  const activeAlert = userAlerts
    .filter((a) => ['pending', 'accepted', 'on_the_way'].includes(a.status))
    .reduce((latest, alert) => {
      if (!latest) return alert
      return new Date(alert.updatedAt).getTime() > new Date(latest.updatedAt).getTime() ? alert : latest
    }, null as typeof alerts[number] | null)
  const resolvedAlert = userAlerts
    .filter((a) => ['reached', 'completed'].includes(a.status))
    .reduce((latest, alert) => {
      if (!latest) return alert
      return new Date(alert.updatedAt).getTime() > new Date(latest.updatedAt).getTime() ? alert : latest
    }, null as typeof alerts[number] | null)
  const hasResolvedAlert = Boolean(resolvedAlert)

  useEffect(() => {
    if (!hasActiveAlert && hasResolvedAlert) {
      setStatus('idle')
    }
  }, [hasActiveAlert, hasResolvedAlert])

  // Handle live location updates from the map
  const handleLocationUpdate = useCallback((location: LiveLocation) => {
    setLiveLocation(location)
  }, [])

  useRealtimeEvents((event) => {
    if (event.type === 'sos-triggered' && event.data?.alert) {
      const alert = event.data.alert
      if (alert.userId === user?.id) {
        addAlert(alert)
        setCurrentAlert(alert)
        setStatus('active')
        addNotification({
          title: 'SOS Alert Confirmed',
          message: 'Your emergency request has been registered and help is being dispatched.',
          type: 'info',
        })
      }
    }

    if (event.type === 'sos-updated' && event.data?.alert) {
      const alert = event.data.alert
      const alertExists = alerts.some((existingAlert) => existingAlert.id === alert.id)
      if (alertExists) {
        updateAlert(alert.id, alert)
      } else {
        addAlert(alert)
      }

      if (alert.userId === user?.id) {
        setCurrentAlert(alert)
        const resolvedStatuses = ['reached', 'completed', 'cancelled']
        if (resolvedStatuses.includes(alert.status)) {
          setStatus('idle')
        } else {
          setStatus('active')
        }
        addNotification({
          title: 'Volunteer Status Updated',
          message: `${alert.assignedVolunteerName || 'A volunteer'} is now ${alert.status.replace(/_/g, ' ')}`,
          type: 'info',
        })
      }
    }

    if (event.type === 'sos-cancelled' && event.data?.alert) {
      const alert = event.data.alert
      const alertExists = alerts.some((existingAlert) => existingAlert.id === alert.id)
      if (alertExists) {
        updateAlert(alert.id, alert)
      } else {
        addAlert(alert)
      }

      if (alert.userId === user?.id) {
        setCurrentAlert(null)
        setStatus('idle')
        addNotification({
          title: 'Emergency Cancelled',
          message: 'Your emergency alert has been cancelled.',
          type: 'warning',
        })
      }
    }
  })

  // Countdown timer
  useEffect(() => {
    if (status === 'confirming' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (status === 'confirming' && countdown === 0) {
      sendEmergencyAlert()
    }
  }, [status, countdown])

  const sendEmergencyAlert = useCallback(async () => {
    if (!user || !liveLocation) return

    setStatus('sending')

    const emergencyContacts = user.emergencyContact
      ? [{ name: 'Emergency Contact', phone: user.emergencyContact }]
      : []

    let result: any = null

    try {
      const response = await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          userLocation: {
            lat: liveLocation.lat,
            lng: liveLocation.lng,
          },
          emergencyContacts,
          timestamp: Date.now(),
        }),
      })

      result = await response.json().catch(() => null)

      if (!response.ok || !result?.success) {
        setStatus('idle')
        toast.error(result?.error || 'Failed to send emergency alert')
        return
      }
    } catch (error) {
      setStatus('idle')
      toast.error('Failed to send emergency alert')
      return
    }

    const createdAlert = result.alert
      ? {
          ...result.alert,
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
        }
      : {
          id: result.emergencyId || Math.random().toString(36).substr(2, 9),
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          latitude: liveLocation.lat,
          longitude: liveLocation.lng,
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

    addAlert(createdAlert)
    setCurrentAlert(createdAlert)
    addNotification({
      title: 'SOS Alert Sent',
      message: 'Your emergency alert has been sent to nearby volunteers.',
      type: 'emergency',
    })

    toast.success('Emergency alert sent! Help is on the way.')
    setStatus('active')

  }, [user, liveLocation, addAlert, setCurrentAlert, updateAlert, addNotification])

  const handleSOSClick = () => {
    if (!liveLocation) {
      toast.error('Please enable location services to use SOS')
      return
    }
    setStatus('confirming')
    setCountdown(5)
  }

  const cancelSOS = () => {
    setStatus('idle')
    setCountdown(5)
  }

  const cancelEmergency = async () => {
    if (!activeAlert) return

    try {
      const response = await fetch('/api/emergency/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId: activeAlert.id,
          userId: user?.id,
          userPhone: user?.phone,
          userName: user?.name,
          timestamp: Date.now(),
        }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        toast.error(result?.error || 'Failed to cancel emergency')
        return
      }

      if (result.alert?.id) {
        updateAlert(result.alert.id, result.alert)
      } else {
        updateAlert(activeAlert.id, {
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        })
      }

      setCurrentAlert(null)
      setStatus('idle')
      toast.success('Emergency cancelled')
    } catch (error) {
      toast.error('Failed to cancel emergency')
    }
  }

  const getStatusColor = (alertStatus: string) => {
    switch (alertStatus) {
      case 'pending': return 'text-yellow-400'
      case 'accepted': return 'text-blue-400'
      case 'on_the_way': return 'text-purple-400'
      case 'reached': return 'text-success'
      case 'completed': return 'text-success'
      default: return 'text-muted-foreground'
    }
  }

  const getStatusText = (alertStatus: string) => {
    switch (alertStatus) {
      case 'pending': return 'Searching for nearby volunteers...'
      case 'accepted': return 'Volunteer has accepted your request'
      case 'on_the_way': return 'Volunteer is on the way'
      case 'reached': return 'You are safe'
      case 'completed': return 'Emergency resolved successfully'
      default: return alertStatus
    }
  }

  // Mock volunteer location for demo
  const volunteerLocation = activeAlert?.assignedVolunteerId && liveLocation
    ? { lat: liveLocation.lat + 0.003, lng: liveLocation.lng + 0.002 }
    : null

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Emergency SOS</h1>
        <p className="text-muted-foreground">
          {activeAlert
            ? 'Your emergency alert is active'
            : 'Press the SOS button in case of emergency'}
        </p>
      </motion.div>

      {/* Location status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`glass-card rounded-xl p-4 flex items-center gap-3 ${
          liveLocation ? 'border-success/30' : 'border-yellow-500/30'
        }`}
      >
        <FiMapPin className={`w-5 h-5 ${liveLocation ? 'text-success' : 'text-yellow-400'}`} />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {liveLocation ? 'Live location tracking active' : 'Getting your location...'}
          </p>
          {liveLocation && (
            <p className="text-xs text-muted-foreground">
              {liveLocation.lat.toFixed(6)}, {liveLocation.lng.toFixed(6)} 
              {liveLocation.accuracy && ` (±${liveLocation.accuracy.toFixed(0)}m)`}
            </p>
          )}
        </div>
        {liveLocation && (
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
        )}
      </motion.div>

      {/* SOS Button or Active Alert */}
      <AnimatePresence mode="wait">
        {!hasActiveAlert && status !== 'active' ? (
          <motion.div
            key="sos-button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card rounded-2xl p-8 text-center"
          >
            {status === 'idle' && (
              <>
                <p className="text-muted-foreground mb-6">
                  Tap the button below to send an emergency alert to nearby volunteers and your emergency contacts.
                </p>
                <motion.button
                  onClick={handleSOSClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!liveLocation}
                  className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-red-600 text-white font-bold text-3xl shadow-lg glow-red sos-pulse mx-auto flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiAlertCircle className="w-16 h-16" />
                  SOS
                </motion.button>
              </>
            )}

            {status === 'confirming' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-xl font-semibold mb-2">Confirm Emergency Alert</p>
                  <p className="text-muted-foreground">
                    Alert will be sent in {countdown} seconds
                  </p>
                </div>
                <div className="w-32 h-32 rounded-full bg-primary/20 border-4 border-primary mx-auto flex items-center justify-center">
                  <span className="text-5xl font-bold text-primary">{countdown}</span>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={cancelSOS}
                    className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all flex items-center gap-2"
                  >
                    <FiX className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    onClick={sendEmergencyAlert}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2"
                  >
                    <FiCheck className="w-5 h-5" />
                    Send Now
                  </button>
                </div>
              </div>
            )}

            {status === 'sending' && (
              <div className="space-y-6">
                <div className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
                <p className="text-lg font-medium">Sending emergency alert...</p>
              </div>
            )}

            {resolvedAlert && (
              <div className="mt-6 rounded-2xl border border-success/20 bg-success/5 p-5 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-3 h-3 bg-success rounded-full animate-pulse" />
                  <h2 className="text-lg font-semibold">You are safe</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Your emergency is complete. Volunteer assistance has arrived and the alert is resolved.
                </p>
                <p className="text-xs text-muted-foreground">
                  Requested at {resolvedAlert ? new Date(resolvedAlert.createdAt).toLocaleString() : '—'}
                </p>
                {resolvedAlert.assignedVolunteerName && (
                  <p className="text-sm text-success mt-3">
                    Helped by {resolvedAlert.assignedVolunteerName}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="active-alert"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card rounded-2xl p-6"
          >
            {/* Alert header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <h2 className="text-xl font-semibold">
                    {activeAlert?.status === 'reached' || activeAlert?.status === 'completed'
                      ? 'Emergency Resolved'
                      : 'Emergency Active'}
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Requested at {activeAlert ? new Date(activeAlert.createdAt).toLocaleString() : '—'}
                </p>
              </div>
              {activeAlert?.status !== 'reached' && activeAlert?.status !== 'completed' && (
                <button
                  onClick={cancelEmergency}
                  className="text-sm px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-all"
                >
                  Cancel Emergency
                </button>
              )}
            </div>

            {/* Status */}
            <div className="mb-6">
              <p className={`text-lg font-medium ${getStatusColor(activeAlert?.status || 'pending')}`}>
                {getStatusText(activeAlert?.status || 'pending')}
              </p>
              {(activeAlert?.status === 'reached' || activeAlert?.status === 'completed') && (
                <p className="text-sm text-success mt-2">
                  Emergency resolved successfully. Your volunteer has arrived and your alert is complete.
                </p>
              )}
            </div>

            {/* Volunteer info */}
            {activeAlert?.assignedVolunteerId && activeAlert?.assignedVolunteerName && (
              <div className="glass rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-2">Responding Volunteer</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <FiNavigation className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{activeAlert.assignedVolunteerName}</p>
                      <p className="text-sm text-muted-foreground">Estimated arrival: 5 mins</p>
                    </div>
                  </div>
                  <button className="p-3 bg-success text-white rounded-full hover:bg-success/90 transition-all">
                    <FiPhone className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Status timeline */}
            <div className="space-y-4">
              {['pending', 'accepted', 'on_the_way', 'reached'].map((step, index) => {
                const isActive = activeAlert?.status === step
                const isPast = ['pending', 'accepted', 'on_the_way', 'reached'].indexOf(activeAlert?.status || '') >= index
                return (
                  <div key={step} className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isPast ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'
                      } ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''}`}
                    >
                      {isPast ? <FiCheck className="w-4 h-4" /> : index + 1}
                    </div>
                    <span className={isPast ? 'text-foreground' : 'text-muted-foreground'}>
                      {step.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Location Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card rounded-2xl p-4 overflow-hidden"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Live Location Tracking
        </h3>
        <div className="rounded-xl overflow-hidden">
          <LiveLocationMap
            showNearbyServices
            height="500px"
            zoom={16}
            volunteerLocation={volunteerLocation}
            showRoute={!!volunteerLocation}
            onLocationUpdate={handleLocationUpdate}
          />
        </div>
      </motion.div>
    </div>
  )
}
