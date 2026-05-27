'use client';

import { useState, useEffect } from 'react';
import {
  AlertCircle,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Users,
  Shield,
  X,
} from 'lucide-react';
import { useEmergencyStore } from '@/lib/emergency-store';
import GeolocationService from '@/lib/geolocation-service';

interface EmergencyFullscreenModalProps {
  open: boolean;
}

export function EmergencyFullscreenModal({ open }: EmergencyFullscreenModalProps) {
  const {
    isEmergencyActive,
    userLocation,
    emergencyStartTime,
    nearbyVolunteers,
    notifiedContacts,
  } = useEmergencyStore();

  const [displayTime, setDisplayTime] = useState('0:00');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isEmergencyActive && emergencyStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - emergencyStartTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        setDisplayTime(`${mins}:${secs.toString().padStart(2, '0')}`);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isEmergencyActive, emergencyStartTime]);

  if (!open || !isEmergencyActive) return null;

  const mapsLink = userLocation
    ? GeolocationService.generateMapsLink(userLocation.lat, userLocation.lng)
    : null;

  const directionLink = userLocation
    ? GeolocationService.generateDirectionLink(userLocation.lat, userLocation.lng)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
      {/* Header - Emergency Alert */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white p-6 border-b-4 border-red-900 sticky top-0 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <AlertCircle className="w-8 h-8 animate-spin flex-shrink-0" />
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold">🚨 EMERGENCY ACTIVE</h1>
              <p className="text-red-100 text-lg">
                Duration: {displayTime} | Real-time assistance engaged
              </p>
            </div>
          </div>

          {/* Critical Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {mapsLink && (
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-red-600 px-4 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-center"
              >
                <MapPin className="w-5 h-5" />
                Live Location
              </a>
            )}
            {directionLink && (
              <a
                href={directionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-red-600 px-4 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-center"
              >
                <Phone className="w-5 h-5" />
                Get Directions
              </a>
            )}
            <button className="bg-white text-red-600 px-4 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Call 911
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bg-white/20 text-white px-4 py-3 rounded-lg font-bold hover:bg-white/30 transition-colors border border-white"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-black text-white p-6 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Timer Card */}
            <div className="bg-gradient-to-br from-red-900 to-red-800 border-2 border-red-600 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-6 h-6" />
                <p className="text-red-200">Emergency Duration</p>
              </div>
              <p className="text-5xl font-bold text-white animate-pulse">{displayTime}</p>
            </div>

            {/* Location Card */}
            {userLocation && (
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-600 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-6 h-6" />
                  <p className="text-blue-200 font-semibold">Live Location</p>
                </div>
                <p className="text-sm font-mono text-blue-100 mb-2">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </p>
                {userLocation.accuracy && (
                  <p className="text-xs text-blue-300">
                    Accuracy: ±{Math.round(userLocation.accuracy)}m
                  </p>
                )}
                <p className="text-xs text-blue-300 mt-2 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Location Sharing: Active
                </p>
              </div>
            )}

            {/* Volunteers Card */}
            <div className="bg-gradient-to-br from-green-900 to-green-800 border-2 border-green-600 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-6 h-6" />
                <p className="text-green-200 font-semibold">Nearby Help</p>
              </div>
              <p className="text-4xl font-bold text-white mb-2">
                {nearbyVolunteers.length}
              </p>
              <p className="text-sm text-green-200">Verified volunteers near you</p>
            </div>
          </div>

          {/* Detailed Information */}
          {showDetails && (
            <div className="space-y-4">
              {/* Nearby Volunteers */}
              {nearbyVolunteers.length > 0 && (
                <div className="bg-gray-900 border-2 border-green-600 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Nearby Volunteers ({nearbyVolunteers.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nearbyVolunteers.map((volunteer, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-800 border border-green-600 rounded-lg p-4"
                      >
                        <p className="text-lg font-bold text-white">
                          {volunteer.name}
                        </p>
                        <div className="space-y-2 mt-3 text-sm">
                          <p className="text-gray-300">
                            📍 {volunteer.distance?.toFixed(1)}km away
                          </p>
                          <p className="text-green-400">✓ Verified Volunteer</p>
                          <p className="text-gray-300">
                            ⏱ ETA: ~{Math.ceil(volunteer.distance || 0 / 50)} min
                          </p>
                        </div>
                        <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition-colors">
                          Call Volunteer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notified Contacts */}
              {notifiedContacts.length > 0 && (
                <div className="bg-gray-900 border-2 border-purple-600 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                    <Phone className="w-6 h-6" />
                    Notified Contacts ({notifiedContacts.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {notifiedContacts.map((contact, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-800 border border-purple-600 rounded-lg p-3 flex items-center justify-between"
                      >
                        <span className="text-white">{contact}</span>
                        <span className="text-green-400 font-bold">✓ Notified</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Information */}
              <div className="bg-gray-900 border-2 border-blue-600 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Safety Information
                </h2>
                <div className="space-y-3 text-gray-300">
                  <p>
                    ✓ <strong>Real-time Location Tracking:</strong> Your GPS location is being
                    continuously shared with emergency responders and verified volunteers.
                  </p>
                  <p>
                    ✓ <strong>Emergency Notifications:</strong> All trusted emergency contacts
                    have been notified with your live location link.
                  </p>
                  <p>
                    ✓ <strong>Admin Monitoring:</strong> Our admin dashboard is actively
                    monitoring your emergency situation.
                  </p>
                  <p>
                    ✓ <strong>Privacy Protected:</strong> Your emergency information is securely
                    protected and only shared during active situations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Tips */}
          <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-lg p-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">⚠️ While Waiting for Help</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Stay in a safe location if possible</li>
              <li>• Keep your phone with you</li>
              <li>• Be ready to answer calls from volunteers or emergency services</li>
              <li>• Do not hang up during calls with responders</li>
              <li>• If you're in immediate danger, call 911 directly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
