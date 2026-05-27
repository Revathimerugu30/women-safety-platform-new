'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Phone, MapPin } from 'lucide-react';
import { useEmergencyStore } from '@/lib/emergency-store';
import { useAuthStore } from '@/lib/store';
import GeolocationService from '@/lib/geolocation-service';
import AlertSoundService from '@/lib/alert-sound-service';
import EmergencySMSService from '@/lib/emergency-sms-service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface SOSButtonProps {
  emergencyContacts?: Array<{ phone: string; name: string }>;
  userName?: string;
  userPhone?: string;
}

export function SOSButton({ emergencyContacts = [], userName = 'User', userPhone }: SOSButtonProps) {
  const {
    isEmergencyActive,
    userLocation,
    triggerSOS,
    cancelSOS,
    setLocation,
  } = useEmergencyStore();

  const currentUser = useAuthStore((state) => state.user);
  const effectiveUserName = userName || currentUser?.name || 'User'
  const userPhoneNumber = userPhone || currentUser?.phone || 'Unknown';

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const soundService = new AlertSoundService();
  const smsService = new EmergencySMSService({ name: 'mock' }); // Change to 'twilio' or 'fast2sms' with credentials

  // Track elapsed time during emergency
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isEmergencyActive) {
      interval = setInterval(() => {
        setElapsedTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isEmergencyActive]);

  const handleSOSClick = async () => {
    if (isEmergencyActive) {
      // If already active, show cancel confirmation
      setShowConfirmDialog(true);
      return;
    }

    // Trigger SOS
    setIsLoading(true);
    setError(null);

    try {
      // Get current location
      const location = await GeolocationService.getCurrentLocation();
      setLocation(location);

      // Trigger emergency in store
      triggerSOS(location);

      // Play emergency alert sound
      soundService.triggerEmergencyAlert();

      // Send SMS to emergency contacts
      if (emergencyContacts.length > 0) {
        await smsService.sendEmergencySMSBulk(
          emergencyContacts,
          userName,
          location.lat,
          location.lng,
          'SOS button activated'
        );
      }

      // Send alert to backend
      const response = await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          userLocation: location,
          emergencyContacts,
          userName: effectiveUserName,
          userPhone: userPhoneNumber,
          timestamp: Date.now(),
        }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Backend failed to deliver SOS alert')
      }
    } catch (err) {
      setError((err as Error).message)
      cancelSOS()
      soundService.playWarningSound()
    } finally {
      setIsLoading(false)
    }
  };

  const handleCancelSOS = async () => {
    cancelSOS();
    setElapsedTime(0);
    setShowConfirmDialog(false);
    soundService.playNotificationSound();

    // Notify backend of cancellation
    await fetch('/api/emergency/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, timestamp: Date.now() }),
    }).catch((err) => console.log('Backend cancel notification:', err));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Floating SOS Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={handleSOSClick}
          disabled={isLoading}
          className={`
            relative w-20 h-20 rounded-full font-bold text-white text-lg
            transition-all duration-300 shadow-xl
            ${
              isEmergencyActive
                ? 'bg-red-600 hover:bg-red-700 animate-pulse border-4 border-red-400'
                : 'bg-red-600 hover:bg-red-700 active:scale-95'
            }
            ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
            flex items-center justify-center
          `}
          title={isEmergencyActive ? 'Click to cancel SOS' : 'Click to trigger SOS'}
        >
          <AlertCircle className="w-8 h-8" />
        </button>

        {/* Status indicator during emergency */}
        {isEmergencyActive && (
          <div className="absolute -top-2 -right-2 animate-bounce">
            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
          </div>
        )}
      </div>

      {/* Emergency Banner - Shows when active */}
      {isEmergencyActive && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-red-700 text-white p-4 border-b-4 border-red-900 shadow-2xl animate-pulse">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 animate-spin" />
              <div>
                <p className="font-bold text-lg">🚨 EMERGENCY ACTIVE</p>
                <p className="text-sm opacity-90">
                  Time Elapsed: {formatTime(elapsedTime)} | Location Sharing: Active
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelSOS}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Cancel SOS
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-white border-2 border-red-600">
          <DialogHeader>
            <DialogTitle className="text-2xl text-red-600">Cancel Emergency?</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to cancel the SOS emergency alert? This will notify your contacts that the emergency has been resolved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {userLocation && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Last Known Location
                </p>
                <p className="text-xs text-gray-600 font-mono">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </p>
                <a
                  href={`https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                >
                  View on Google Maps →
                </a>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                Keep Active
              </Button>
              <Button
                onClick={handleCancelSOS}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-32 right-8 bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-lg shadow-lg z-40 max-w-xs">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs underline mt-2 hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}
