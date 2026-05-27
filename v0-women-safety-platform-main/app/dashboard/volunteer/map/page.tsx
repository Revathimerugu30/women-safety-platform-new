'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { FiMapPin, FiNavigation, FiAlertCircle } from 'react-icons/fi'
import { useEmergencyStore } from '@/lib/store'
import type { LiveLocation, EmergencyMarker } from '@/components/maps/live-location-map'

const LiveLocationMap = dynamic(() => import('@/components/maps/live-location-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-card rounded-xl animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground">Loading live map...</span>
    </div>
  ),
})

export default function VolunteerMapPage() {
  const { alerts } = useEmergencyStore()
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null)

  const handleLocationUpdate = useCallback((location: LiveLocation) => {
    setLiveLocation(location)
  }, [])

  // Get active emergencies to show on map
  const activeAlerts = alerts.filter((a) => 
    ['pending', 'accepted', 'on_the_way'].includes(a.status)
  )

  const emergencyMarkers: EmergencyMarker[] = activeAlerts.map((alert) => ({
    id: alert.id,
    lat: alert.latitude,
    lng: alert.longitude,
    userName: alert.userName,
    status: alert.status,
    createdAt: alert.createdAt,
  }))

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Live Map</h1>
        <p className="text-muted-foreground">
          Track your location and view emergency alerts in real-time
        </p>
      </motion.div>

      {/* Location status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card rounded-xl p-4 flex items-center gap-3"
      >
        <FiNavigation className={`w-5 h-5 ${liveLocation ? 'text-success' : 'text-yellow-400'}`} />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {liveLocation ? 'Live tracking active' : 'Getting your location...'}
          </p>
          {liveLocation && (
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>
                <FiMapPin className="inline w-3 h-3 mr-1" />
                {liveLocation.lat.toFixed(6)}, {liveLocation.lng.toFixed(6)}
              </span>
              {liveLocation.accuracy && (
                <span>Accuracy: ±{liveLocation.accuracy.toFixed(0)}m</span>
              )}
              {liveLocation.speed !== null && liveLocation.speed > 0 && (
                <span>Speed: {(liveLocation.speed * 3.6).toFixed(1)} km/h</span>
              )}
            </div>
          )}
        </div>
        {liveLocation && <span className="w-2 h-2 bg-success rounded-full animate-pulse" />}
      </motion.div>

      {/* Active emergencies */}
      {activeAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass-card rounded-xl p-4"
        >
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-primary" />
            Active Emergencies ({activeAlerts.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg text-sm"
              >
                <span className="font-medium">{alert.userName}</span>
                <span className="text-muted-foreground ml-2 capitalize">
                  ({alert.status.replace(/_/g, ' ')})
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Map legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
        transition={{ duration: 0.5, delay: 0.25 }}
        className="glass-card rounded-2xl p-4 overflow-hidden"
      >
        <div className="rounded-xl overflow-hidden">
          <LiveLocationMap
            showNearbyServices
            height="600px"
            zoom={15}
            emergencies={emergencyMarkers}
            onLocationUpdate={handleLocationUpdate}
          />
        </div>
      </motion.div>
    </div>
  )
}
