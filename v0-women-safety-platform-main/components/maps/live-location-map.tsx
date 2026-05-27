'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FiNavigation, FiMapPin, FiAlertCircle, FiPhone, FiExternalLink, FiRefreshCw } from 'react-icons/fi'

// Place types for nearby services
interface NearbyPlace {
  id: number
  name: string
  lat: number
  lng: number
  type: 'hospital' | 'police' | 'pharmacy' | 'bank' | 'ambulance' | 'safe_zone' | 'fire_station'
  distance: number
  phone?: string
  address?: string
  openingHours?: string
}

// Create custom SVG marker icons with animations
const createCustomIcon = (
  type: 'user' | 'hospital' | 'police' | 'pharmacy' | 'bank' | 'ambulance' | 'safe_zone' | 'fire_station' | 'volunteer' | 'emergency',
  size: number = 40
) => {
  const icons: Record<string, { color: string; bg: string; icon: string; glow: string }> = {
    user: {
      color: '#FFFFFF',
      bg: '#FF3B3B',
      glow: '#FF3B3B',
      icon: `<circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z" fill="currentColor"/>`,
    },
    hospital: {
      color: '#FFFFFF',
      bg: '#3B82F6',
      glow: '#3B82F6',
      icon: `<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" fill="currentColor"/>`,
    },
    police: {
      color: '#FFFFFF',
      bg: '#F59E0B',
      glow: '#F59E0B',
      icon: `<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" fill="currentColor"/>`,
    },
    pharmacy: {
      color: '#FFFFFF',
      bg: '#10B981',
      glow: '#10B981',
      icon: `<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" fill="currentColor"/>`,
    },
    bank: {
      color: '#FFFFFF',
      bg: '#8B5CF6',
      glow: '#8B5CF6',
      icon: `<path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z" fill="currentColor"/>`,
    },
    ambulance: {
      color: '#FFFFFF',
      bg: '#EF4444',
      glow: '#EF4444',
      icon: `<path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h1c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h1c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm-1 15c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3-4H6v-3h5v3zm0-5H6V7h5v3zm2 0V7h5v3h-5zm2 9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="currentColor"/>`,
    },
    safe_zone: {
      color: '#FFFFFF',
      bg: '#22C55E',
      glow: '#22C55E',
      icon: `<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/>`,
    },
    fire_station: {
      color: '#FFFFFF',
      bg: '#F97316',
      glow: '#F97316',
      icon: `<path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" fill="currentColor"/>`,
    },
    volunteer: {
      color: '#FFFFFF',
      bg: '#A855F7',
      glow: '#A855F7',
      icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>`,
    },
    emergency: {
      color: '#FFFFFF',
      bg: '#FF3B3B',
      glow: '#FF3B3B',
      icon: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>`,
    },
  }

  const config = icons[type] || icons.user
  const isUser = type === 'user'
  const isEmergency = type === 'emergency'

  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isUser || isEmergency ? `
          <div style="
            position: absolute;
            width: ${size * 2}px;
            height: ${size * 2}px;
            background: ${config.glow}40;
            border-radius: 50%;
            animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            top: -${size / 2}px;
            left: -${size / 2}px;
          "></div>
        ` : ''}
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${config.bg};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px ${config.glow}60, 0 2px 4px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          ${isUser ? `animation: marker-bounce 2s ease-in-out infinite;` : ''}
        ">
          <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" style="color: ${config.color};">
            ${config.icon}
          </svg>
        </div>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid ${config.bg};
          z-index: 0;
        "></div>
      </div>
      <style>
        @keyframes pulse-ring {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes marker-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      </style>
    `,
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 10],
    popupAnchor: [0, -size],
  })
}

// Pre-create icons
const userIcon = createCustomIcon('user', 44)
const hospitalIcon = createCustomIcon('hospital', 36)
const policeIcon = createCustomIcon('police', 36)
const pharmacyIcon = createCustomIcon('pharmacy', 36)
const bankIcon = createCustomIcon('bank', 36)
const ambulanceIcon = createCustomIcon('ambulance', 36)
const safeZoneIcon = createCustomIcon('safe_zone', 36)
const fireStationIcon = createCustomIcon('fire_station', 36)
const volunteerIcon = createCustomIcon('volunteer', 38)
const emergencyIcon = createCustomIcon('emergency', 42)

// Map place type to icon
const getIconForType = (type: NearbyPlace['type']) => {
  const iconMap = {
    hospital: hospitalIcon,
    police: policeIcon,
    pharmacy: pharmacyIcon,
    bank: bankIcon,
    ambulance: ambulanceIcon,
    safe_zone: safeZoneIcon,
    fire_station: fireStationIcon,
  }
  return iconMap[type] || hospitalIcon
}

// Calculate distance between two points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000 // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Format distance for display
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

// Fetch nearby places from Overpass API (OpenStreetMap)
const fetchNearbyPlaces = async (lat: number, lng: number, radius: number = 2000): Promise<NearbyPlace[]> => {
  const queries = [
    { type: 'hospital' as const, amenity: 'hospital' },
    { type: 'police' as const, amenity: 'police' },
    { type: 'pharmacy' as const, amenity: 'pharmacy' },
    { type: 'bank' as const, amenity: 'bank' },
    { type: 'fire_station' as const, amenity: 'fire_station' },
  ]

  const overpassQuery = `
    [out:json][timeout:25];
    (
      ${queries.map((q) => `node["amenity"="${q.amenity}"](around:${radius},${lat},${lng});`).join('\n      ')}
      ${queries.map((q) => `way["amenity"="${q.amenity}"](around:${radius},${lat},${lng});`).join('\n      ')}
    );
    out center body;
  `

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.warn(
        '[v0] Overpass API returned non-ok response:',
        response.status,
        response.statusText,
        errorText
      )
      return []
    }

    const data = await response.json()
    const places: NearbyPlace[] = []
    const seenIds = new Set<string>()

    data.elements.forEach((element: { id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: { name?: string; amenity?: string; phone?: string; 'addr:street'?: string; 'addr:housenumber'?: string; 'addr:city'?: string; opening_hours?: string } }) => {
      const elementLat = element.lat || element.center?.lat
      const elementLng = element.lon || element.center?.lon
      const tags = element.tags || {}

      if (!elementLat || !elementLng) return

      // Create unique key based on name and approximate location
      const uniqueKey = `${tags.name || 'unnamed'}-${elementLat.toFixed(4)}-${elementLng.toFixed(4)}`
      if (seenIds.has(uniqueKey)) return
      seenIds.add(uniqueKey)

      const amenityType = tags.amenity as NearbyPlace['type']
      const distance = calculateDistance(lat, lng, elementLat, elementLng)

      // Build address from components
      let address = ''
      if (tags['addr:street']) {
        address = tags['addr:housenumber'] ? `${tags['addr:housenumber']} ${tags['addr:street']}` : tags['addr:street']
        if (tags['addr:city']) {
          address += `, ${tags['addr:city']}`
        }
      }

      places.push({
        id: element.id,
        name: tags.name || `${amenityType.charAt(0).toUpperCase() + amenityType.slice(1).replace(/_/g, ' ')}`,
        lat: elementLat,
        lng: elementLng,
        type: amenityType,
        distance,
        phone: tags.phone,
        address: address || undefined,
        openingHours: tags.opening_hours,
      })
    })

    // Sort by distance and limit results
    return places.sort((a, b) => a.distance - b.distance).slice(0, 50)
  } catch (error) {
    console.error('[v0] Error fetching nearby places:', error)
    return []
  }
}

// Component to update map view
function MapUpdater({ center, followUser }: { center: { lat: number; lng: number }; followUser: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (followUser && center) {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true })
    }
  }, [center, followUser, map])

  return null
}

// Accuracy circle component
function AccuracyCircle({ position, accuracy }: { position: { lat: number; lng: number }; accuracy: number }) {
  return (
    <Circle
      center={[position.lat, position.lng]}
      radius={accuracy}
      pathOptions={{
        color: '#FF3B3B',
        fillColor: '#FF3B3B',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '5, 5',
      }}
    />
  )
}

export interface LiveLocation {
  lat: number
  lng: number
  accuracy: number
  heading: number | null
  speed: number | null
  timestamp: number
}

export interface EmergencyMarker {
  id: string
  lat: number
  lng: number
  userName: string
  userPhone?: string
  status: string
  createdAt: string
}

interface LiveLocationMapProps {
  showNearbyServices?: boolean
  zoom?: number
  height?: string
  emergencies?: EmergencyMarker[]
  volunteerLocation?: { lat: number; lng: number; name?: string } | null
  showRoute?: boolean
  onLocationUpdate?: (location: LiveLocation) => void
}

export default function LiveLocationMap({
  showNearbyServices = false,
  zoom = 16,
  height = '500px',
  emergencies = [],
  volunteerLocation,
  showRoute = false,
  onLocationUpdate,
}: LiveLocationMapProps) {
  const [mapKey] = useState(() => `live-map-${Math.random().toString(36).slice(2)}`)
  const [mounted, setMounted] = useState(false)
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null)
  const [locationHistory, setLocationHistory] = useState<{ lat: number; lng: number }[]>([])
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([])
  const [followUser, setFollowUser] = useState(true)
  const [locationStatus, setLocationStatus] = useState<'loading' | 'active' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false)
  const [visibleTypes, setVisibleTypes] = useState<Record<NearbyPlace['type'], boolean>>({
    hospital: true,
    police: true,
    pharmacy: true,
    bank: false,
    ambulance: true,
    safe_zone: true,
    fire_station: true,
  })
  const watchIdRef = useRef<number | null>(null)
  const lastFetchedLocation = useRef<{ lat: number; lng: number } | null>(null)

  // Start watching location
  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      setErrorMessage('Geolocation is not supported by your browser')
      return
    }

    setLocationStatus('loading')

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: LiveLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        }

        setLiveLocation(newLocation)
        setLocationStatus('active')
        setErrorMessage(null)

        setLocationHistory((prev) => {
          const last = prev[prev.length - 1]
          if (!last || Math.abs(last.lat - newLocation.lat) > 0.00001 || Math.abs(last.lng - newLocation.lng) > 0.00001) {
            const newHistory = [...prev, { lat: newLocation.lat, lng: newLocation.lng }]
            return newHistory.slice(-100)
          }
          return prev
        })

        if (onLocationUpdate) {
          onLocationUpdate(newLocation)
        }
      },
      (error) => {
        setLocationStatus('error')
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Location permission denied. Please enable location access.')
            break
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Location information is unavailable.')
            break
          case error.TIMEOUT:
            setErrorMessage('Location request timed out.')
            break
          default:
            setErrorMessage('An unknown error occurred.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    )
  }, [onLocationUpdate])

  // Stop watching location
  const stopWatchingLocation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  // Start watching on mount
  useEffect(() => {
    startWatchingLocation()
    return () => stopWatchingLocation()
  }, [startWatchingLocation, stopWatchingLocation])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch nearby places when location changes significantly
  const fetchPlaces = useCallback(async () => {
    if (!liveLocation || !showNearbyServices) return

    const lastLoc = lastFetchedLocation.current
    if (lastLoc) {
      const distance = calculateDistance(lastLoc.lat, lastLoc.lng, liveLocation.lat, liveLocation.lng)
      if (distance < 200) return // Only refetch if moved more than 200m
    }

    setIsLoadingPlaces(true)
    lastFetchedLocation.current = { lat: liveLocation.lat, lng: liveLocation.lng }

    const places = await fetchNearbyPlaces(liveLocation.lat, liveLocation.lng, 3000)
    setNearbyPlaces(places)
    setIsLoadingPlaces(false)
  }, [liveLocation, showNearbyServices])

  useEffect(() => {
    if (showNearbyServices && liveLocation && nearbyPlaces.length === 0) {
      fetchPlaces()
    }
  }, [showNearbyServices, liveLocation, nearbyPlaces.length, fetchPlaces])

  const mapCenter = liveLocation || { lat: 40.7128, lng: -74.006 }

  // Filter visible places
  const visiblePlaces = nearbyPlaces.filter((place) => visibleTypes[place.type])

  // Type labels for legend
  const typeLabels: Record<NearbyPlace['type'], { label: string; color: string }> = {
    hospital: { label: 'Hospitals', color: '#3B82F6' },
    police: { label: 'Police', color: '#F59E0B' },
    pharmacy: { label: 'Pharmacy', color: '#10B981' },
    bank: { label: 'Banks', color: '#8B5CF6' },
    ambulance: { label: 'Ambulance', color: '#EF4444' },
    safe_zone: { label: 'Safe Zones', color: '#22C55E' },
    fire_station: { label: 'Fire Station', color: '#F97316' },
  }

  // Open navigation in Google Maps
  const openNavigation = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`
    window.open(url, '_blank')
  }

  return (
    <div className="relative" style={{ height }}>
      {/* Location status overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 max-w-[280px]">
        <div
          className={`px-3 py-2 rounded-lg backdrop-blur-md text-sm font-medium flex items-center gap-2 ${
            locationStatus === 'active'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : locationStatus === 'loading'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {locationStatus === 'active' && (
            <>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live Tracking Active
            </>
          )}
          {locationStatus === 'loading' && (
            <>
              <span className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              Getting location...
            </>
          )}
          {locationStatus === 'error' && (
            <>
              <FiAlertCircle className="w-4 h-4" />
              {errorMessage}
            </>
          )}
        </div>

        {liveLocation && (
          <div className="px-3 py-2 rounded-lg backdrop-blur-md bg-card/90 border border-border text-xs space-y-1">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <FiMapPin className="w-3 h-3 text-primary" />
              <span>Your Location</span>
            </div>
            <div className="text-muted-foreground pl-5">
              {liveLocation.lat.toFixed(6)}, {liveLocation.lng.toFixed(6)}
            </div>
            {liveLocation.accuracy && (
              <div className="text-muted-foreground pl-5">Accuracy: {liveLocation.accuracy.toFixed(0)}m</div>
            )}
            {liveLocation.speed !== null && liveLocation.speed > 0 && (
              <div className="text-muted-foreground pl-5">Speed: {(liveLocation.speed * 3.6).toFixed(1)} km/h</div>
            )}
          </div>
        )}
      </div>

      {/* Legend/Filter panel */}
      {showNearbyServices && (
        <div className="absolute top-3 right-14 z-[1000]">
          <div className="px-3 py-2 rounded-lg backdrop-blur-md bg-card/90 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">Nearby Places</span>
              <button
                onClick={fetchPlaces}
                disabled={isLoadingPlaces}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <FiRefreshCw className={`w-3 h-3 ${isLoadingPlaces ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-1">
              {Object.entries(typeLabels).map(([type, { label, color }]) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={visibleTypes[type as NearbyPlace['type']]}
                    onChange={(e) => setVisibleTypes((prev) => ({ ...prev, [type]: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-muted-foreground/60 ml-auto">
                    ({nearbyPlaces.filter((p) => p.type === type).length})
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Follow user toggle */}
      <button
        onClick={() => setFollowUser(!followUser)}
        className={`absolute bottom-20 right-3 z-[1000] p-3 rounded-full backdrop-blur-md transition-all ${
          followUser ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-card/90 text-muted-foreground border border-border'
        }`}
        title={followUser ? 'Following your location' : 'Click to follow your location'}
      >
        <FiNavigation className={`w-5 h-5 ${followUser ? 'fill-current' : ''}`} />
      </button>

      {/* Recenter button */}
      {liveLocation && !followUser && (
        <button
          onClick={() => setFollowUser(true)}
          className="absolute bottom-32 right-3 z-[1000] px-3 py-2 rounded-lg backdrop-blur-md bg-card/90 border border-border text-sm font-medium hover:bg-muted transition-all"
        >
          Re-center
        </button>
      )}

      {mounted ? (
        <MapContainer
          key={mapKey}
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={zoom}
          style={{ height: '100%', width: '100%', borderRadius: '12px' }}
          zoomControl={true}
        >
          {/* Dark theme map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapUpdater center={mapCenter} followUser={followUser} />

        {/* User's live location */}
        {liveLocation && (
          <>
            <AccuracyCircle position={liveLocation} accuracy={liveLocation.accuracy} />
            <Marker position={[liveLocation.lat, liveLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <FiMapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Your Location</p>
                      <p className="text-xs text-gray-500">Live GPS Tracking</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      <strong>Coordinates:</strong> {liveLocation.lat.toFixed(6)}, {liveLocation.lng.toFixed(6)}
                    </p>
                    <p>
                      <strong>Accuracy:</strong> {liveLocation.accuracy.toFixed(0)} meters
                    </p>
                    {liveLocation.speed !== null && liveLocation.speed > 0 && (
                      <p>
                        <strong>Speed:</strong> {(liveLocation.speed * 3.6).toFixed(1)} km/h
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Location history path */}
        {locationHistory.length > 1 && (
          <Polyline
            positions={locationHistory.map((p) => [p.lat, p.lng])}
            pathOptions={{
              color: '#FF3B3B',
              weight: 3,
              opacity: 0.7,
              dashArray: '8, 12',
            }}
          />
        )}

        {/* Emergency markers */}
        {emergencies.map((emergency) => (
          <Marker key={emergency.id} position={[emergency.lat, emergency.lng]} icon={emergencyIcon}>
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                    <FiAlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-600">EMERGENCY ALERT</p>
                    <p className="text-xs text-gray-500">{emergency.userName}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className="capitalize">{emergency.status.replace(/_/g, ' ')}</span>
                  </p>
                  <p>
                    <strong>Time:</strong> {new Date(emergency.createdAt).toLocaleTimeString()}
                  </p>
                  {emergency.userPhone && (
                    <a
                      href={`tel:${emergency.userPhone}`}
                      className="flex items-center gap-1 text-blue-600 hover:underline mt-2"
                    >
                      <FiPhone className="w-3 h-3" />
                      Call: {emergency.userPhone}
                    </a>
                  )}
                </div>
                {liveLocation && (
                  <button
                    onClick={() => openNavigation(emergency.lat, emergency.lng, emergency.userName)}
                    className="mt-2 w-full py-1.5 px-3 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 flex items-center justify-center gap-1"
                  >
                    <FiExternalLink className="w-3 h-3" />
                    Navigate
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Volunteer location */}
        {volunteerLocation && (
          <Marker position={[volunteerLocation.lat, volunteerLocation.lng]} icon={volunteerIcon}>
            <Popup>
              <div className="p-2 min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-600">Volunteer</p>
                    <p className="text-xs text-gray-500">{volunteerLocation.name || 'Responding'}</p>
                  </div>
                </div>
                <p className="text-xs text-green-600 font-medium">On the way to help</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route between user and volunteer */}
        {showRoute && liveLocation && volunteerLocation && (
          <Polyline
            positions={[
              [liveLocation.lat, liveLocation.lng],
              [volunteerLocation.lat, volunteerLocation.lng],
            ]}
            pathOptions={{
              color: '#A855F7',
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}

        {/* Nearby places markers */}
        {showNearbyServices &&
          visiblePlaces.map((place) => (
            <Marker key={`${place.type}-${place.id}`} position={[place.lat, place.lng]} icon={getIconForType(place.type)}>
              <Popup>
                <div className="p-2 min-w-[220px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: typeLabels[place.type].color }}
                    >
                      <span className="text-white text-xs font-bold">
                        {place.type === 'hospital'
                          ? 'H'
                          : place.type === 'police'
                            ? 'P'
                            : place.type === 'pharmacy'
                              ? 'Rx'
                              : place.type === 'bank'
                                ? 'B'
                                : place.type === 'fire_station'
                                  ? 'F'
                                  : 'S'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{place.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{place.type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="flex items-center gap-1">
                      <FiMapPin className="w-3 h-3" />
                      <strong>{formatDistance(place.distance)}</strong> away
                    </p>
                    {place.address && <p className="text-gray-500">{place.address}</p>}
                    {place.phone && (
                      <a href={`tel:${place.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <FiPhone className="w-3 h-3" />
                        {place.phone}
                      </a>
                    )}
                    {place.openingHours && (
                      <p className="text-gray-500">
                        <strong>Hours:</strong> {place.openingHours}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => openNavigation(place.lat, place.lng, place.name)}
                    className="mt-2 w-full py-1.5 px-3 text-white text-xs font-medium rounded flex items-center justify-center gap-1"
                    style={{ backgroundColor: typeLabels[place.type].color }}
                  >
                    <FiExternalLink className="w-3 h-3" />
                    Get Directions
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
      ) : (
        <div className="w-full h-full bg-slate-950" />
      )}
    </div>
  )
}
