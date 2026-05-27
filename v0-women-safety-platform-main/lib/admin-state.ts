import type { EmergencyAlert } from '@/lib/store'

export interface AdminStats {
  totalUsers: number
  totalVolunteers: number
  activeEmergencies: number
  todayRegistrations: number
  lastUpdated: string
}

type RegistrationType = 'user' | 'volunteer'

export interface StoredAdminNotification {
  id: string
  type:
    | 'user_registered'
    | 'volunteer_registered'
    | 'sos_triggered'
    | 'sos_updated'
    | 'sos_cancelled'
    | 'sms_sent'
    | 'user_login'
    | 'volunteer_login'
  title: string
  message: string
  data: {
    alertId?: string
    userName?: string
    phone?: string
    email?: string
    location?: { lat: number; lng: number }
    timestamp: number
  }
}

export interface RegisteredAccount {
  id?: string
  name?: string
  email?: string
  phone?: string
  address?: string
  role?: RegistrationType
  status?: 'active' | 'blocked' | 'inactive'
  createdAt?: string
  lastLoginAt?: string
}

interface AdminState {
  users: Map<string, RegisteredAccount>
  volunteers: Map<string, RegisteredAccount>
  todayRegistrations: number
  registrationsDate: string
  emergencies: EmergencyAlert[]
  notifications: StoredAdminNotification[]
}

const createInitialState = (): AdminState => ({
  users: new Map<string, RegisteredAccount>(),
  volunteers: new Map<string, RegisteredAccount>(),
  todayRegistrations: 0,
  registrationsDate: new Date().toDateString(),
  emergencies: [],
  notifications: [],
})

const globalForAdminState = globalThis as typeof globalThis & {
  __safeHerAdminState?: AdminState
}

const state = globalForAdminState.__safeHerAdminState ?? createInitialState()
globalForAdminState.__safeHerAdminState = state

function getAccountKey(account: RegisteredAccount) {
  return (account.email || account.phone || '').trim().toLowerCase()
}

function resetDailyCountersIfNeeded() {
  const today = new Date().toDateString()

  if (state.registrationsDate !== today) {
    state.registrationsDate = today
    state.todayRegistrations = 0
  }
}

export function selectAvailableVolunteer() {
  const volunteer = Array.from(state.volunteers.values()).find(
    (account) => account.status === 'active' && account.name
  )

  if (!volunteer) {
    return null
  }

  return {
    id: volunteer.id || getAccountKey(volunteer) || `vol-${Date.now()}`,
    name: volunteer.name || 'Verified Volunteer',
  }
}

export function getAdminStats(): AdminStats {
  resetDailyCountersIfNeeded()

  return {
    totalUsers: state.users.size,
    totalVolunteers: state.volunteers.size,
    activeEmergencies: state.emergencies.filter((alert) =>
      ['pending', 'accepted', 'on_the_way', 'reached'].includes(alert.status)
    ).length,
    todayRegistrations: state.todayRegistrations,
    lastUpdated: new Date().toISOString(),
  }
}

export function recordRegistration(userType: RegistrationType, account: RegisteredAccount = {}) {
  resetDailyCountersIfNeeded()

  const key = getAccountKey(account) || `${userType}-${Date.now()}-${Math.random()}`
  const registry = userType === 'volunteer' ? state.volunteers : state.users
  const isNewAccount = !registry.has(key)

  registry.set(key, {
    id: account.id || registry.get(key)?.id,
    status: 'active',
    ...account,
    role: userType,
  })

  if (isNewAccount) {
    state.todayRegistrations += 1
  }

  return {
    stats: getAdminStats(),
    isNewAccount,
  }
}

export function syncRegisteredAccounts(accounts: RegisteredAccount[]) {
  resetDailyCountersIfNeeded()

  accounts.forEach((account) => {
    const userType = account.role === 'volunteer' ? 'volunteer' : 'user'
    const key = getAccountKey(account)

    if (!key) {
      return
    }

    if (userType === 'volunteer') {
      state.volunteers.set(key, {
        status: 'active',
        ...state.volunteers.get(key),
        ...account,
        role: userType,
      })
    } else {
      state.users.set(key, {
        status: 'active',
        ...state.users.get(key),
        ...account,
        role: userType,
      })
    }
  })

  return getAdminStats()
}

export function getRegisteredAccounts() {
  const users = Array.from(state.users.entries()).map(([key, account]) => ({
    id: account.id || key,
    name: account.name || 'User',
    email: account.email || '',
    phone: account.phone || '',
    address: account.address || '',
    role: 'user' as const,
    status: account.status || 'active',
    createdAt: account.createdAt,
    lastLoginAt: account.lastLoginAt,
  }))
  const volunteers = Array.from(state.volunteers.entries()).map(([key, account]) => ({
    id: account.id || key,
    name: account.name || 'Volunteer',
    email: account.email || '',
    phone: account.phone || '',
    address: account.address || '',
    role: 'volunteer' as const,
    status: account.status || 'active',
    createdAt: account.createdAt,
    lastLoginAt: account.lastLoginAt,
  }))

  return {
    users,
    volunteers,
    all: [...users, ...volunteers],
  }
}

export function addAdminNotification(notification: StoredAdminNotification) {
  const exists = state.notifications.some((existingNotification) => existingNotification.id === notification.id)

  if (!exists) {
    state.notifications = [notification, ...state.notifications].slice(0, 50)
  }

  return notification
}

export function getAdminNotifications() {
  return state.notifications
}

export function removeAdminNotificationsByAlertId(alertId: string) {
  state.notifications = state.notifications.filter(
    (notification) => notification.data.alertId !== alertId
  )
}

export function updateEmergencyStatus(
  alertId: string,
  updates: Partial<Pick<EmergencyAlert, 'status' | 'assignedVolunteerId' | 'assignedVolunteerName'>>
): { alert: EmergencyAlert | null; stats: AdminStats } {
  let updatedAlert: EmergencyAlert | null = null

  state.emergencies = state.emergencies.map((alert) => {
    if (alert.id !== alertId) {
      return alert
    }

    updatedAlert = {
      ...alert,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return updatedAlert
  })

  return {
    alert: updatedAlert,
    stats: getAdminStats(),
  }
}

export function recordEmergency(alert: EmergencyAlert) {
  // New emergencies should enter the system as pending so volunteers can accept them.
  // We only assign a volunteer when a responder explicitly accepts the request.
  const finalAlert = alert

  const exists = state.emergencies.some((existingAlert) => existingAlert.id === finalAlert.id)

  if (!exists) {
    state.emergencies = [finalAlert, ...state.emergencies].slice(0, 100)
  }

  return {
    alert: finalAlert,
    stats: getAdminStats(),
  }
}

export function resolveEmergency(
  params: {
    alertId?: string
    userId?: string
    userPhone?: string
    userName?: string
  },
  resolution: 'completed' | 'cancelled' = 'completed'
) {
  const { alertId, userId, userPhone, userName } = params
  let emergencyIndex = -1

  if (alertId) {
    emergencyIndex = state.emergencies.findIndex((alert) => alert.id === alertId)
  }

  if (emergencyIndex === -1 && userId) {
    emergencyIndex = state.emergencies.findIndex(
      (alert) =>
        alert.userId === userId &&
        alert.status !== 'completed' &&
        alert.status !== 'cancelled'
    )
  }

  if (emergencyIndex === -1 && userPhone) {
    emergencyIndex = state.emergencies.findIndex(
      (alert) =>
        alert.userPhone === userPhone &&
        alert.status !== 'completed' &&
        alert.status !== 'cancelled'
    )
  }

  if (emergencyIndex === -1 && userName) {
    emergencyIndex = state.emergencies.findIndex(
      (alert) =>
        alert.userName === userName &&
        alert.status !== 'completed' &&
        alert.status !== 'cancelled'
    )
  }

  if (emergencyIndex === -1) {
    return {
      alert: null,
      stats: getAdminStats(),
    }
  }

  const alert = state.emergencies[emergencyIndex]
  const resolvedAlert: EmergencyAlert = {
    ...alert,
    status: resolution,
    updatedAt: new Date().toISOString(),
  }

  state.emergencies = [
    ...state.emergencies.slice(0, emergencyIndex),
    resolvedAlert,
    ...state.emergencies.slice(emergencyIndex + 1),
  ]

  return {
    alert: resolvedAlert,
    stats: getAdminStats(),
  }
}

export function getEmergencies() {
  return state.emergencies
}
