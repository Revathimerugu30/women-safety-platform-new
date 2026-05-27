/**
 * Geolocation Service
 * Handles real-time GPS location tracking and coordinates
 */

export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export class GeolocationService {
  private watchId: number | null = null;
  private lastLocation: LocationCoordinates | null = null;

  /**
   * Get current user location once
   */
  static async getCurrentLocation(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          resolve({
            lat: latitude,
            lng: longitude,
            accuracy,
            timestamp: Date.now(),
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Watch location continuously
   */
  watchLocation(
    onLocationUpdate: (location: LocationCoordinates) => void,
    onError?: (error: Error) => void
  ): void {
    if (!navigator.geolocation) {
      onError?.(new Error('Geolocation not supported'));
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const location: LocationCoordinates = {
          lat: latitude,
          lng: longitude,
          accuracy,
          timestamp: Date.now(),
        };
        this.lastLocation = location;
        onLocationUpdate(location);
      },
      (error) => {
        onError?.(new Error(`Location watch error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  /**
   * Stop watching location
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Get last known location
   */
  getLastLocation(): LocationCoordinates | null {
    return this.lastLocation;
  }

  /**
   * Generate Google Maps live location link
   */
  static generateMapsLink(lat: number, lng: number): string {
    return `https://maps.google.com/?q=${lat},${lng}`;
  }

  /**
   * Generate Google Maps direction link
   */
  static generateDirectionLink(lat: number, lng: number): string {
    return `https://maps.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  /**
   * Calculate distance between two coordinates (in km)
   */
  static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export default GeolocationService;
