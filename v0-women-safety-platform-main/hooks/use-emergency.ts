import { useEmergencyStore } from '@/lib/emergency-store';
import GeolocationService from '@/lib/geolocation-service';
import AlertSoundService from '@/lib/alert-sound-service';
import EmergencySMSService from '@/lib/emergency-sms-service';

/**
 * Hook for managing emergency functionality
 */
export function useEmergency() {
  const store = useEmergencyStore();
  const soundService = new AlertSoundService();
  const smsService = new EmergencySMSService({ name: 'mock' });

  const triggerEmergency = async (
    contacts: Array<{ phone: string; name: string }>,
    userName: string = 'User',
    userId?: string,
    userPhone?: string
  ) => {
    try {
      // Get current location
      const location = await GeolocationService.getCurrentLocation();

      // Update store
      store.triggerSOS(location);

      // Play alert sound and vibration
      soundService.triggerEmergencyAlert();

      // Send SMS to contacts
      if (contacts.length > 0) {
        await smsService.sendEmergencySMSBulk(
          contacts,
          userName,
          location.lat,
          location.lng
        );

        // Mark contacts as notified
        contacts.forEach((contact) => {
          store.addNotifiedContact(contact.name);
        });
      }

      // Trigger backend notification
      await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userLocation: location,
          emergencyContacts: contacts,
          userName,
          userPhone,
          timestamp: Date.now(),
        }),
      });

      return { success: true, location };
    } catch (error) {
      soundService.playWarningSound();
      throw error;
    }
  };

  const cancelEmergency = async (userName: string = 'User') => {
    try {
      store.cancelSOS();
      soundService.playSuccessSound();

      // Notify backend
      await fetch('/api/emergency/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          timestamp: Date.now(),
        }),
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const watchLocation = (
    onUpdate?: (location: any) => void,
    onError?: (error: Error) => void
  ) => {
    const geolocation = new GeolocationService();
    geolocation.watchLocation(
      (location) => {
        store.setLocation(location);
        onUpdate?.(location);
      },
      onError
    );

    return () => geolocation.stopWatching();
  };

  return {
    ...store,
    triggerEmergency,
    cancelEmergency,
    watchLocation,
    getLocationLink: (lat: number, lng: number) =>
      GeolocationService.generateMapsLink(lat, lng),
    getDirectionLink: (lat: number, lng: number) =>
      GeolocationService.generateDirectionLink(lat, lng),
  };
}
