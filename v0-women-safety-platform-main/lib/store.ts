import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'user' | 'volunteer' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  phone: string
  address: string
  role: UserRole
  password?: string
  profilePhoto?: string
  emergencyContact?: string
  skills?: string
  availability?: boolean
  createdAt: string
}

export interface EmergencyAlert {
  id: string
  userId: string
  userName: string
  userPhone: string
  latitude: number
  longitude: number
  status: 'pending' | 'accepted' | 'on_the_way' | 'reached' | 'completed' | 'cancelled'
  assignedVolunteerId?: string
  assignedVolunteerName?: string
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'emergency' | 'info' | 'success' | 'warning'
  read: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

interface EmergencyState {
  alerts: EmergencyAlert[]
  currentAlert: EmergencyAlert | null
  addAlert: (alert: EmergencyAlert) => void
  updateAlert: (id: string, updates: Partial<EmergencyAlert>) => void
  setCurrentAlert: (alert: EmergencyAlert | null) => void
  removeAlert: (id: string) => void
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}



export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
)

export const useEmergencyStore = create<EmergencyState>()(
  persist(
    (set) => ({
      alerts: [],
      currentAlert: null,
      addAlert: (alert) =>
        set((state) => ({
          alerts: state.alerts.some((existingAlert) => existingAlert.id === alert.id)
            ? state.alerts.map((existingAlert) =>
                existingAlert.id === alert.id ? { ...existingAlert, ...alert } : existingAlert
              )
            : [alert, ...state.alerts],
        })),
      updateAlert: (id, updates) =>
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === id ? { ...alert, ...updates, updatedAt: new Date().toISOString() } : alert
          ),
          currentAlert:
            state.currentAlert?.id === id
              ? { ...state.currentAlert, ...updates, updatedAt: new Date().toISOString() }
              : state.currentAlert,
        })),
      setCurrentAlert: (alert) => set({ currentAlert: alert }),
      removeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== id),
          currentAlert: state.currentAlert?.id === id ? null : state.currentAlert,
        })),
    }),
    {
      name: 'emergency-storage',
    }
  )
)

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          read: false,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50),
          unreadCount: state.unreadCount + 1,
        }))
      },
      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          if (notification && !notification.read) {
            return {
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            }
          }
          return state
        }),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: 'notification-storage',
    }
  )
)
