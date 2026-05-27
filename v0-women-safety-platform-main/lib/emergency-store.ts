import { create } from 'zustand';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  notified: boolean;
}

interface EmergencyLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface EmergencyState {
  isEmergencyActive: boolean;
  userLocation: EmergencyLocation | null;
  emergencyStartTime: number | null;
  notifiedContacts: string[];
  nearbyVolunteers: any[];
  emergencyMessage: string;
  
  // Actions
  triggerSOS: (location: EmergencyLocation) => void;
  cancelSOS: () => void;
  setLocation: (location: EmergencyLocation) => void;
  addNotifiedContact: (contactId: string) => void;
  setNearbyVolunteers: (volunteers: any[]) => void;
  setEmergencyMessage: (message: string) => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  isEmergencyActive: false,
  userLocation: null,
  emergencyStartTime: null,
  notifiedContacts: [],
  nearbyVolunteers: [],
  emergencyMessage: 'EMERGENCY ALERT! User may be in danger.',

  triggerSOS: (location) =>
    set({
      isEmergencyActive: true,
      userLocation: location,
      emergencyStartTime: Date.now(),
      notifiedContacts: [],
      nearbyVolunteers: [],
    }),

  cancelSOS: () =>
    set({
      isEmergencyActive: false,
      userLocation: null,
      emergencyStartTime: null,
      notifiedContacts: [],
      nearbyVolunteers: [],
    }),

  setLocation: (location) =>
    set({ userLocation: location }),

  addNotifiedContact: (contactId) =>
    set((state) => ({
      notifiedContacts: [...state.notifiedContacts, contactId],
    })),

  setNearbyVolunteers: (volunteers) =>
    set({ nearbyVolunteers: volunteers }),

  setEmergencyMessage: (message) =>
    set({ emergencyMessage: message }),
}));
