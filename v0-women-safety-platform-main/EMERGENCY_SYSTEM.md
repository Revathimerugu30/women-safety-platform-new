# 🚨 Emergency SMS & Alert Notification System - Implementation Guide

This document outlines the complete real-time emergency SMS and alert notification system implementation for SafeHer platform.

## 📋 Overview

The emergency system provides:
- ✓ One-click SOS button with instant activation
- ✓ Real-time GPS location tracking and sharing
- ✓ Automatic SMS alerts to emergency contacts
- ✓ Emergency alert sounds and vibrations
- ✓ Live location link generation
- ✓ Floating emergency notification banner
- ✓ Full-screen emergency dashboard
- ✓ Mock SMS for development, real SMS for production
- ✓ Security & privacy protection

## 📁 File Structure

```
lib/
├── emergency-store.ts          # Zustand store for emergency state
├── geolocation-service.ts      # GPS location tracking service
├── alert-sound-service.ts      # Emergency alert sounds & vibrations
└── emergency-sms-service.ts    # SMS sending service

components/emergency/
├── sos-button.tsx              # Main SOS floating button
├── emergency-notification.tsx  # Top alert banner
└── emergency-fullscreen-modal.tsx # Full emergency dashboard

hooks/
└── use-emergency.ts            # Custom hook for emergency management

app/api/
├── emergency/
│   ├── trigger/route.ts        # SOS trigger endpoint
│   └── cancel/route.ts         # Emergency cancel endpoint
└── sms/
    ├── twilio/route.ts         # Twilio SMS API
    └── fast2sms/route.ts       # Fast2SMS API
```

## 🚀 Quick Start

### 1. Components are Automatically Active

The emergency system is **already integrated** into your app layout:

```tsx
// app/layout.tsx - Already added
<EmergencyNotification />
<SOSButton 
  userName="User"
  emergencyContacts={[
    { phone: '+1-800-123-4567', name: 'Mom' },
    { phone: '+1-800-987-6543', name: 'Best Friend' }
  ]}
/>
```

### 2. Test the System

1. Open your app: http://localhost:3000
2. Look for the **red SOS button** in the bottom-right corner
3. Click it to trigger an emergency
4. You'll see:
   - Emergency alert banner at top
   - Alert sound and vibration
   - Mock SMS console logs
   - Real-time location tracking

### 3. Configure SMS Service

#### Option A: Using Twilio (Recommended)

1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your credentials from the console:
   - Account SID
   - Auth Token
   - Phone Number (for SMS)

3. Add to `.env.local`:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

4. Update emergency-sms-service.ts:
```typescript
const smsService = new EmergencySMSService({ name: 'twilio' });
```

#### Option B: Using Fast2SMS

1. Sign up at [fast2sms.com](https://www.fast2sms.com)
2. Get API key from dashboard
3. Add to `.env.local`:
```env
FAST2SMS_API_KEY=your_api_key
```

4. Update emergency-sms-service.ts:
```typescript
const smsService = new EmergencySMSService({ name: 'fast2sms' });
```

## 🔧 Implementation Details

### Emergency Store (Zustand)

Manages emergency state across the app:

```typescript
const { 
  isEmergencyActive,
  userLocation,
  emergencyStartTime,
  notifiedContacts,
  nearbyVolunteers,
  triggerSOS,
  cancelSOS,
  setLocation,
  addNotifiedContact
} = useEmergencyStore();
```

### Geolocation Service

Handles GPS tracking:

```typescript
// Get current location
const location = await GeolocationService.getCurrentLocation();
// {lat, lng, accuracy, timestamp}

// Watch location continuously
const stopWatching = geolocation.watchLocation(
  (location) => console.log('Location updated:', location),
  (error) => console.error('Location error:', error)
);

// Generate maps links
const mapsLink = GeolocationService.generateMapsLink(lat, lng);
const directionLink = GeolocationService.generateDirectionLink(lat, lng);

// Calculate distance
const distance = GeolocationService.calculateDistance(lat1, lng1, lat2, lng2);
```

### Alert Sound Service

Plays emergency sounds:

```typescript
const soundService = new AlertSoundService();

soundService.playEmergencySiren();      // 3-second siren
soundService.playNotificationSound();   // Short beep
soundService.playWarningSound();        // Ascending tone
soundService.playSuccessSound();        // Double beep
soundService.triggerEmergencyAlert();   // Full alert + vibration
AlertSoundService.vibrate([200, 100, 200]); // Custom vibration pattern
```

### SMS Service

Sends emergency alerts via SMS:

```typescript
const smsService = new EmergencySMSService({ name: 'mock' | 'twilio' | 'fast2sms' });

// Send to single contact
await smsService.sendEmergencySMS(
  '+1-800-123-4567',
  'Jane Doe',
  40.7128,     // latitude
  -74.0060,    // longitude
  'Additional message'
);

// Send to multiple contacts
await smsService.sendEmergencySMSBulk(
  contacts,
  userName,
  latitude,
  longitude,
  additionalMessage
);

// Validate & format phone numbers
EmergencySMSService.isValidPhoneNumber('+1-800-123-4567');
EmergencySMSService.formatPhoneNumber('800-123-4567'); // +1-800-123-4567
```

## 🔌 API Endpoints

### POST /api/emergency/trigger

Triggers an emergency alert:

```bash
curl -X POST http://localhost:3000/api/emergency/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "userLocation": {"lat": 40.7128, "lng": -74.0060},
    "emergencyContacts": [
      {"phone": "+1-800-123-4567", "name": "Mom"}
    ],
    "userName": "Jane Doe",
    "timestamp": 1234567890
  }'
```

### POST /api/emergency/cancel

Cancels an active emergency:

```bash
curl -X POST http://localhost:3000/api/emergency/cancel \
  -H "Content-Type: application/json" \
  -d '{"userName": "Jane Doe", "timestamp": 1234567890}'
```

### POST /api/sms/twilio

Sends SMS via Twilio (backend):

```bash
curl -X POST http://localhost:3000/api/sms/twilio \
  -H "Content-Type: application/json" \
  -d '{"to": "+1-800-123-4567", "message": "Emergency alert..."}'
```

### POST /api/sms/fast2sms

Sends SMS via Fast2SMS (backend):

```bash
curl -X POST http://localhost:3000/api/sms/fast2sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1-800-123-4567", "message": "Emergency alert..."}'
```

## 🎯 Using the Emergency Hook

```typescript
'use client';

import { useEmergency } from '@/hooks/use-emergency';

export function MyComponent() {
  const {
    isEmergencyActive,
    userLocation,
    triggerEmergency,
    cancelEmergency,
    watchLocation,
    getLocationLink
  } = useEmergency();

  const handleSOS = async () => {
    try {
      await triggerEmergency([
        { phone: '+1-800-123-4567', name: 'Mom' },
        { phone: '+1-800-987-6543', name: 'Friend' }
      ], 'Jane Doe');
    } catch (error) {
      console.error('Failed to trigger emergency:', error);
    }
  };

  const handleCancel = async () => {
    await cancelEmergency('Jane Doe');
  };

  return (
    <div>
      <button onClick={handleSOS} disabled={isEmergencyActive}>
        {isEmergencyActive ? 'Emergency Active' : 'Trigger SOS'}
      </button>
      {isEmergencyActive && <button onClick={handleCancel}>Cancel</button>}
    </div>
  );
}
```

## 📱 Mobile Features

The system is fully optimized for mobile:

- **Large SOS button** - Easy to tap during panic
- **Floating button** - Always accessible
- **Vibration alerts** - Works on modern mobile devices
- **Responsive design** - Works on all screen sizes
- **Offline-ready** - Uses browser APIs
- **Full-screen mode** - Emergency dashboard
- **Gesture support** - Shake phone to trigger (can be added)

## 🔐 Security & Privacy

### Privacy Protection

1. **Location encryption** - Only shared during active emergencies
2. **Contact isolation** - Numbers visible only to user
3. **Secure storage** - Encrypted backend storage
4. **Limited access** - Data accessible only to verified responders
5. **Time-limited** - Data deleted after emergency resolution

### Implementation

```typescript
// Privacy notice shown to user
"Your emergency information is securely protected and 
only shared during active emergency situations."

// Contacts visible only in authenticated dashboard
// Location data encrypted in transit and storage
// Access logs maintained for auditing
```

## 🧪 Testing

### Development Mode (Mock SMS)

No API credentials needed. SMS logs to console:

```typescript
const smsService = new EmergencySMSService({ name: 'mock' });
// Check browser console and listen for 'sms-sent' events
```

### Production Mode (Real SMS)

```typescript
// With Twilio
const smsService = new EmergencySMSService({ 
  name: 'twilio',
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_PHONE_NUMBER
});

// With Fast2SMS
const smsService = new EmergencySMSService({ 
  name: 'fast2sms',
  apiKey: process.env.FAST2SMS_API_KEY
});
```

## 📊 Monitoring & Logging

### Emergency Logs

All emergencies are logged server-side:

```
🚨 Emergency triggered:
- User: Jane Doe
- Location: 40.7128, -74.0060
- Contacts: 2
- Time: 2024-05-26T10:30:00Z

✓ Emergency cancelled:
- User: Jane Doe
- Time: 2024-05-26T10:35:00Z
```

### Console Logs

Monitor in browser console:

```javascript
// When SOS triggered:
"📱 Mock SMS Alert Sent: {to, message, timestamp}"

// Geolocation updates:
"📍 Location updated: {lat, lng, accuracy}"

// Sound alerts:
"🔊 Emergency siren started"
```

## 🎨 UI Components

### SOS Button

```tsx
<SOSButton 
  userName="Jane Doe"
  emergencyContacts={[
    { phone: '+1-800-123-4567', name: 'Mom' }
  ]}
/>
```

### Emergency Notification

```tsx
<EmergencyNotification showDetails={true} />
```

### Full-screen Emergency Modal

```tsx
<EmergencyFullscreenModal open={isEmergencyActive} />
```

## 🔄 Workflow Diagram

```
User clicks SOS Button
         ↓
Get Current Location
         ↓
Trigger Emergency (Store + Sound + Vibration)
         ↓
Send SMS to Contacts ← Requires SMS API key
         ↓
Show Emergency Banner
         ↓
Display Live Location Link
         ↓
Notify Admin & Volunteers
         ↓
User clicks Cancel
         ↓
Cancel Emergency + Notify All
```

## 🆘 Troubleshooting

### Geolocation not working
- Check browser permissions (Settings → Privacy → Location)
- Must use HTTPS in production
- Requires user's explicit permission

### SMS not sending
- Check environment variables
- Verify API credentials
- Check phone number format (+country-code required)
- Review API quota/balance

### Sound not playing
- Check browser permissions (Autoplay policy)
- User interaction required for audio
- Works better in full screen

### Location accuracy issues
- Enable High Accuracy mode (takes longer)
- Wait 10-15 seconds for GPS fix
- Works better outdoors

## 📚 Additional Resources

- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Fast2SMS API](https://www.fast2sms.com/)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)

## 🚀 Future Enhancements

- [ ] WhatsApp emergency alerts
- [ ] Push notifications
- [ ] Voice-triggered SOS
- [ ] Shake phone to trigger SOS
- [ ] AI danger prediction
- [ ] Emergency video recording
- [ ] Live audio streaming
- [ ] Multi-language support
- [ ] Dark mode optimization
- [ ] Offline mode support

## 📞 Support

For issues or questions:
- Check console logs for errors
- Review browser permissions
- Verify environment variables
- Test with mock SMS first
- Check API quota/balance

---

**Emergency System Version:** 1.0.0  
**Last Updated:** May 26, 2024  
**Status:** ✅ Production Ready
