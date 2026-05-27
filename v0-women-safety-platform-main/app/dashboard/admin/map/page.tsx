'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { FiMapPin, FiAlertCircle, FiUsers, FiNavigation } from 'react-icons/fi'
import { useEmergencyStore } from '@/lib/store'
import { useRealtimeEvents } from '@/hooks/use-realtime-events'
import type { LiveLocation, EmergencyMarker } from '@/components/maps/live-location-map'

const LiveLocationMap = dynamic(() => import('@/components/maps/live-location-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[700px] bg-card rounded-xl animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground">Loading live map...</span>
    </div>
  ),
})

export default function AdminMapPage() {
  const { alerts } = useEmergencyStore()
  const addAlert = useEmergencyStore((state) => state.addAlert)
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null)

  useRealtimeEvents((event) => {
    if (
      ['sos-triggered', 'sos-updated', 'sos-cancelled'].includes(event.type) &&
      event.data?.alert
    ) {
      addAlert(event.data.alert)
    }
  })

  const handleLocationUpdate = useCallback((location: LiveLocation) => {
    setLiveLocation(location)
  }, [])

  const activeAlerts = alerts.filter((a) => 
    ['pending', 'accepted', 'on_the_way', 'reached'].includes(a.status)
  )

  const emergencyMarkers: EmergencyMarker[] = activeAlerts.map((alert) => ({
    id: alert.id,
    lat: alert.latitude,
    lng: alert.longitude,
    userName: alert.userName,
    userPhone: alert.userPhone,
    status: alert.status,
    createdAt: alert.createdAt,
  }))

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Command Center Map</h1>
        <p className="text-muted-foreground">
          Real-time monitoring of all emergency locations and resources
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FiAlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeAlerts.length}</p>
              <p className="text-xs text-muted-foreground">Active Alerts</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <FiAlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeAlerts.filter(a => a.status === 'pending').length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <FiUsers className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">Active Volunteers</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FiNavigation className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeAlerts.filter(a => a.status === 'on_the_way').length}</p>
              <p className="text-xs text-muted-foreground">En Route</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Location status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="glass-card rounded-xl p-4 flex items-center gap-3"
      >
        <FiMapPin className={`w-5 h-5 ${liveLocation ? 'text-success' : 'text-yellow-400'}`} />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {liveLocation ? 'Command center location active' : 'Getting location...'}
          </p>
          {liveLocation && (
            <p className="text-xs text-muted-foreground">
              {liveLocation.lat.toFixed(6)}, {liveLocation.lng.toFixed(6)}
              {liveLocation.accuracy && ` (±${liveLocation.accuracy.toFixed(0)}m)`}
            </p>
          )}
        </div>
        {liveLocation && <span className="w-2 h-2 bg-success rounded-full animate-pulse" />}
      </motion.div>

      {/* Active emergencies list */}
      {activeAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card rounded-xl p-4"
        >
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-primary" />
            Active Emergencies
          </h3>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-card/50 border border-border rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{alert.userName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    alert.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    alert.status === 'accepted' ? 'bg-blue-500/20 text-blue-400' :
                    alert.status === 'on_the_way' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {alert.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                </p>
                <a
                  href={`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                >
                  <FiMapPin className="w-3 h-3" />
                  Open live location
                </a>
                {alert.assignedVolunteerName && (
                  <p className="text-xs text-success mt-1">
                    Assigned: {alert.assignedVolunteerName}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Map legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="glass-card rounded-xl p-4"
      >
        <h3 className="font-medium mb-3">Map Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg shadow-red-500/50" />
            <span className="text-muted-foreground">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
            <span className="text-muted-foreground">Emergency</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            <span className="text-muted-foreground">Volunteer</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
            <span className="text-muted-foreground">Hospital</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white" />
            <span className="text-muted-foreground">Police</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white" />
            <span className="text-muted-foreground">Safe Zone</span>
          </div>
        </div>
      </motion.div>

      {/* Live Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card rounded-2xl p-4 overflow-hidden"
      >
        <div className="rounded-xl overflow-hidden">
          <LiveLocationMap
            showNearbyServices
            height="700px"
            zoom={14}
            emergencies={emergencyMarkers}
            onLocationUpdate={handleLocationUpdate}
          />
        </div>
      </motion.div>
    </div>
  )
}
