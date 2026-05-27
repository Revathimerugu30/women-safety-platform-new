'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiUsers,
  FiUser,
  FiSearch,
  FiFilter,
  FiMail,
  FiPhone,
  FiSlash,
  FiCheck,
  FiMapPin,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useRealtimeEvents } from '@/hooks/use-realtime-events'
import { syncRegisteredUsersWithAdmin } from '@/lib/admin-sync-client'

type UserType = 'all' | 'users' | 'volunteers'

interface AdminAccount {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  role: 'user' | 'volunteer'
  status: 'active' | 'blocked' | 'inactive'
  createdAt?: string
  lastLoginAt?: string
}

export default function AdminUsersPage() {
  const [userType, setUserType] = useState<UserType>('all')
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<AdminAccount[]>([])
  const [volunteers, setVolunteers] = useState<AdminAccount[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAccounts = async () => {
    try {
      await syncRegisteredUsersWithAdmin()
      const response = await fetch(new URL('/api/admin/accounts', window.location.origin).href)

      if (!response.ok) {
        console.error('Admin accounts fetch failed:', response.status, response.statusText)
        return
      }

      const data = await response.json()
      setUsers(data.accounts?.users || [])
      setVolunteers(data.accounts?.volunteers || [])
    } catch (error) {
      console.error('Failed to fetch admin accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  useRealtimeEvents((event) => {
    if (['stats-update', 'user-registered', 'notification'].includes(event.type)) {
      fetchAccounts()
    }
  })

  const allUsers = [...users, ...volunteers]

  const filteredUsers = allUsers.filter((user) => {
    const query = search.toLowerCase()
    const matchesSearch =
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.includes(search)

    if (userType === 'all') return matchesSearch
    if (userType === 'users') return matchesSearch && user.role === 'user'
    if (userType === 'volunteers') return matchesSearch && user.role === 'volunteer'
    return matchesSearch
  })

  const toggleUserStatus = (id: string, type: 'user' | 'volunteer') => {
    if (type === 'user') {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === id
            ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' }
            : user
        )
      )
    } else {
      setVolunteers((currentVolunteers) =>
        currentVolunteers.map((volunteer) =>
          volunteer.id === id
            ? { ...volunteer, status: volunteer.status === 'active' ? 'inactive' : 'active' }
            : volunteer
        )
      )
    }
    toast.success('User status updated')
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage users and volunteers on the platform
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <FiUsers className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-muted-foreground">Total Users</span>
          </div>
          <p className="text-2xl font-bold">{loading ? '...' : users.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <FiUser className="w-5 h-5 text-success" />
            <span className="text-sm text-muted-foreground">Total Volunteers</span>
          </div>
          <p className="text-2xl font-bold">{loading ? '...' : volunteers.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <FiSlash className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Blocked</span>
          </div>
          <p className="text-2xl font-bold">
            {
              users.filter((user) => user.status === 'blocked').length +
                volunteers.filter((volunteer) => volunteer.status === 'inactive').length
            }
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-muted-foreground" />
            {(['all', 'users', 'volunteers'] as UserType[]).map((type) => (
              <button
                key={type}
                onClick={() => setUserType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  userType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Contact</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Activity</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 px-6 text-center text-muted-foreground">
                    {loading ? 'Loading users...' : 'No users or volunteers found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={`${user.role}-${user.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user.role === 'volunteer' ? 'bg-green-500/10' : 'bg-blue-500/10'
                          }`}
                        >
                          <FiUser
                            className={`w-5 h-5 ${
                              user.role === 'volunteer' ? 'text-success' : 'text-blue-400'
                            }`}
                          />
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <FiMail className="w-4 h-4" />
                          {user.email || 'No email'}
                        </p>
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <FiPhone className="w-4 h-4" />
                          {user.phone || 'No phone'}
                        </p>
                        {user.address && (
                          <p className="flex items-center gap-1 text-muted-foreground">
                            <FiMapPin className="w-4 h-4" />
                            {user.address}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'volunteer'
                            ? 'bg-green-500/10 text-success'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-success/10 text-success'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {user.lastLoginAt
                        ? `Last login ${new Date(user.lastLoginAt).toLocaleTimeString()}`
                        : user.createdAt
                          ? `Joined ${new Date(user.createdAt).toLocaleDateString()}`
                          : 'Registered'}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.role)}
                        className={`p-2 rounded-lg transition-all ${
                          user.status === 'active'
                            ? 'bg-primary/10 text-primary hover:bg-primary/20'
                            : 'bg-success/10 text-success hover:bg-success/20'
                        }`}
                        aria-label="Toggle user status"
                      >
                        {user.status === 'active' ? (
                          <FiSlash className="w-5 h-5" />
                        ) : (
                          <FiCheck className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
