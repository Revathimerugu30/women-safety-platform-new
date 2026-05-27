'use client';

import { useState } from 'react';
import { useEmergency } from '@/hooks/use-emergency';
import { AlertCircle, MapPin, Phone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Emergency System Demo Component
 * Shows how to use the emergency system in your app
 */
export function EmergencySystemDemo() {
  const {
    isEmergencyActive,
    userLocation,
    triggerEmergency,
    cancelEmergency,
    emergencyStartTime,
  } = useEmergency();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample emergency contacts
  const emergencyContacts = [
    { phone: '+1-800-123-4567', name: 'Mom' },
    { phone: '+1-800-987-6543', name: 'Best Friend' },
    { phone: '+1-800-555-1234', name: 'Sister' },
  ];

  const handleTriggerSOS = async () => {
    setLoading(true);
    setError(null);

    try {
      await triggerEmergency(emergencyContacts, 'Demo User');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSOS = async () => {
    setLoading(true);
    try {
      await cancelEmergency('Demo User');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-red-600 mb-2">
          🚨 Emergency System Demo
        </h1>
        <p className="text-gray-600">
          Test the real-time SOS alert system with SMS, location tracking, and notifications.
        </p>
      </div>

      {/* Status Card */}
      <Card className="border-2 border-red-600 bg-red-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle
            className={`w-6 h-6 ${
              isEmergencyActive ? 'text-red-600 animate-spin' : 'text-gray-400'
            }`}
          />
          <div>
            <h2 className="font-bold text-lg">
              {isEmergencyActive ? '🚨 EMERGENCY ACTIVE' : 'Status: Ready'}
            </h2>
            <p className="text-sm text-gray-600">
              {isEmergencyActive
                ? 'Emergency system is active'
                : 'System ready for emergency activation'}
            </p>
          </div>
        </div>

        {userLocation && (
          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              📍 Current Location
            </p>
            <p className="text-xs font-mono text-gray-600">
              {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            </p>
            {userLocation.accuracy && (
              <p className="text-xs text-gray-600 mt-1">
                Accuracy: ±{Math.round(userLocation.accuracy)}m
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Control Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleTriggerSOS}
          disabled={isEmergencyActive || loading}
          className="flex-1 bg-red-600 hover:bg-red-700 h-14 text-lg font-bold"
        >
          <Zap className="w-5 h-5 mr-2" />
          {loading ? 'Triggering...' : 'Trigger SOS'}
        </Button>

        {isEmergencyActive && (
          <Button
            onClick={handleCancelSOS}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 h-14 text-lg font-bold"
          >
            Cancel Emergency
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
          <p className="font-bold text-red-700">Error</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Emergency Contacts */}
      <Card className="border-2 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Emergency Contacts
        </h3>
        <div className="space-y-3">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.phone}
              className="bg-gray-50 p-3 rounded-lg border border-gray-200"
            >
              <p className="font-semibold text-gray-800">{contact.name}</p>
              <p className="text-sm text-gray-600 font-mono">
                {contact.phone}
              </p>
              <p className="text-xs text-green-600 mt-1">
                ✓ Will receive SMS alert
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          💡 These contacts will receive SMS with your live location when you
          trigger SOS
        </p>
      </Card>

      {/* Features Grid */}
      <Card className="border-2 p-6">
        <h3 className="text-xl font-bold mb-4">Features Included</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-semibold text-blue-900">📍 Live Location</p>
            <p className="text-sm text-blue-700">
              Real-time GPS tracking with accuracy info
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="font-semibold text-green-900">📱 SMS Alerts</p>
            <p className="text-sm text-green-700">
              Automatic SMS to emergency contacts
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="font-semibold text-purple-900">🔊 Alert Sound</p>
            <p className="text-sm text-purple-700">
              Emergency siren with vibration
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="font-semibold text-orange-900">🎯 Notifications</p>
            <p className="text-sm text-orange-700">
              Real-time alert banner & dashboard
            </p>
          </div>
          <div className="bg-pink-50 p-3 rounded-lg">
            <p className="font-semibold text-pink-900">🔐 Secure</p>
            <p className="text-sm text-pink-700">
              Encrypted data, privacy protected
            </p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg">
            <p className="font-semibold text-indigo-900">⏱️ Timer</p>
            <p className="text-sm text-indigo-700">
              Track emergency duration in real-time
            </p>
          </div>
        </div>
      </Card>

      {/* SMS Provider Info */}
      <Card className="border-2 border-yellow-600 bg-yellow-50 p-6">
        <h3 className="text-lg font-bold text-yellow-900 mb-2">
          📧 SMS Configuration
        </h3>
        <p className="text-sm text-yellow-800 mb-3">
          Currently using <strong>Mock SMS</strong> (development mode).
        </p>
        <div className="bg-white p-3 rounded border border-yellow-200 mb-3">
          <p className="text-xs font-mono text-gray-700">
            • SMS logs to browser console
            <br />• No real SMS sent
            <br />• Perfect for testing
          </p>
        </div>
        <p className="text-sm text-yellow-800">
          To enable real SMS:
        </p>
        <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-1 mt-2">
          <li>Sign up at Twilio.com or Fast2SMS.com</li>
          <li>Add API credentials to .env.local</li>
          <li>Update emergency-sms-service.ts provider</li>
          <li>Test with real phone numbers</li>
        </ol>
      </Card>

      {/* Integration Guide */}
      <Card className="border-2 border-blue-600 bg-blue-50 p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          💡 How to Use in Your App
        </h3>
        <pre className="bg-white p-3 rounded border border-blue-200 overflow-x-auto text-xs">
{`import { useEmergency } from '@/hooks/use-emergency';

export function MyComponent() {
  const { isEmergencyActive, triggerEmergency } = useEmergency();
  
  return (
    <button onClick={() => triggerEmergency(contacts, 'User Name')}>
      SOS
    </button>
  );
}`}
        </pre>
      </Card>

      {/* Live Status */}
      {isEmergencyActive && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-lg border-2 border-red-800">
          <h4 className="text-lg font-bold mb-2">🚨 Emergency Active</h4>
          <div className="space-y-2 text-sm">
            <p>✓ Location being tracked continuously</p>
            <p>✓ Emergency contacts notified via SMS</p>
            <p>✓ Admin dashboard monitoring active</p>
            <p>✓ Alert banner visible at top of page</p>
            <p>✓ SOS button now shows cancel option</p>
          </div>
        </div>
      )}
    </div>
  );
}
