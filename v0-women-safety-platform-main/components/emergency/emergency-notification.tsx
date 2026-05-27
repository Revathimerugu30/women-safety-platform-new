'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, MapPin, Phone, Clock, CheckCircle } from 'lucide-react';
import { useEmergencyStore } from '@/lib/emergency-store';
import GeolocationService from '@/lib/geolocation-service';

interface EmergencyNotificationProps {
  showDetails?: boolean;
}

export function EmergencyNotification({ showDetails = false }: EmergencyNotificationProps) {
  const {
    isEmergencyActive,
    userLocation,
    emergencyStartTime,
    nearbyVolunteers,
    notifiedContacts,
  } = useEmergencyStore();

  const [displayTime, setDisplayTime] = useState('0:00');

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

  if (!isEmergencyActive) return null;

  const mapsLink = userLocation
    ? GeolocationService.generateMapsLink(userLocation.lat, userLocation.lng)
    : null;

  return (
    <>
      {/* Top Alert Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white p-4 border-b-4 border-red-900 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 animate-spin flex-shrink-0" />
            <div>
              <p className="font-bold text-lg">🚨 EMERGENCY ALERT ACTIVE</p>
              <p className="text-sm opacity-90">
                Emergency triggered {displayTime} ago • Real-time tracking enabled
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
            {mapsLink && (
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                View Live Location
              </a>
            )}
            <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Call Emergency Services
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-colors">
              Send All-Clear Signal
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel - Emergency Details (Optional) */}
      {showDetails && (
        <div className="fixed right-0 top-20 z-40 w-full max-w-sm bg-white border-l-4 border-red-600 shadow-2xl rounded-l-lg m-4 p-4">
          <div className="space-y-4">
            {/* Timer */}
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-red-600">Emergency Duration</p>
              </div>
              <p className="text-3xl font-bold text-red-600">{displayTime}</p>
            </div>

            {/* Location */}
            {userLocation && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-600">Live Location</p>
                </div>
                <p className="text-xs text-gray-700 font-mono">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </p>
                {userLocation.accuracy && (
                  <p className="text-xs text-gray-600 mt-1">
                    Accuracy: ±{Math.round(userLocation.accuracy)}m
                  </p>
                )}
              </div>
            )}

            {/* Nearby Volunteers */}
            {nearbyVolunteers.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-semibold text-green-600">
                    Nearby Volunteers ({nearbyVolunteers.length})
                  </p>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {nearbyVolunteers.map((volunteer, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-white p-2 rounded border border-green-100"
                    >
                      <p className="font-semibold text-gray-800">
                        {volunteer.name}
                      </p>
                      <p className="text-gray-600">
                        {volunteer.distance?.toFixed(1)}km away
                      </p>
                      <p className="text-green-600 text-xs mt-1">
                        ✓ Verified Volunteer
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notified Contacts */}
            {notifiedContacts.length > 0 && (
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-purple-600" />
                  <p className="text-sm font-semibold text-purple-600">
                    Contacts Notified ({notifiedContacts.length})
                  </p>
                </div>
                <ul className="space-y-1 text-xs text-gray-700">
                  {notifiedContacts.map((contact, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      {contact}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-600">
              <p className="font-semibold mb-1">🔒 Privacy & Security</p>
              <p>
                Your emergency information is securely protected and only shared
                during active emergency situations.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
