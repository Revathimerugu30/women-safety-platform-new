import type { User } from '@/lib/store'

export async function syncRegisteredUsersWithAdmin(extraUsers: Partial<User>[] = []) {
  if (typeof window === 'undefined') {
    return
  }

  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
  const mergedUsers = [...users]

  extraUsers.forEach((extraUser) => {
    if (!extraUser.email && !extraUser.phone) {
      return
    }

    const existingIndex = mergedUsers.findIndex(
      (user: Partial<User>) =>
        (extraUser.email && user.email === extraUser.email) ||
        (extraUser.phone && user.phone === extraUser.phone)
    )

    if (existingIndex >= 0) {
      mergedUsers[existingIndex] = {
        ...mergedUsers[existingIndex],
        ...extraUser,
      }
    } else {
      mergedUsers.push(extraUser)
    }
  })

  try {
    const response = await fetch('/api/admin/sync-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users: mergedUsers }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data?.stats) {
        window.dispatchEvent(
          new CustomEvent('stats-updated', {
            detail: data.stats,
          })
        )
      }
    }
  } catch (error) {
    console.warn('Unable to sync admin user counts:', error)
  }
}

export async function syncCurrentUserWithAdmin(user: User) {
  await syncRegisteredUsersWithAdmin([user])

  const notificationKey = `admin-login-notified-${user.id}-${user.role}`

  if (sessionStorage.getItem(notificationKey)) {
    return
  }

  try {
    const response = await fetch('/api/admin/user-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: user.id,
        userName: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.role,
      }),
    })

    if (response.ok) {
      const data = await response.json()

      if (data?.stats) {
        window.dispatchEvent(
          new CustomEvent('stats-updated', {
            detail: data.stats,
          })
        )
      }

      if (data?.notification) {
        window.dispatchEvent(
          new CustomEvent('admin-notification', {
            detail: data.notification,
          })
        )
      }
    }

    sessionStorage.setItem(notificationKey, 'true')
  } catch (error) {
    console.warn('Admin login notification failed:', error)
  }
}
