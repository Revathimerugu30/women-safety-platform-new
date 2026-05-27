'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  FiUsers, 
  FiUserCheck, 
  FiAlertCircle, 
  FiCheckCircle,
  FiArrowUp,
  FiArrowDown,
  FiTrendingUp
} from 'react-icons/fi'
import { useEmergencyStore } from '@/lib/store'
import { AdminDashboardStats } from '@/components/admin/dashboard-stats'
import { useRealtimeEvents } from '@/hooks/use-realtime-events'
import { syncRegisteredUsersWithAdmin } from '@/lib/admin-sync-client'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

// Empty chart data - add your own data here
const alertsData = [
  { name: 'Mon', alerts: 0, resolved: 0 },
  { name: 'Tue', alerts: 0, resolved: 0 },
  { name: 'Wed', alerts: 0, resolved: 0 },
  { name: 'Thu', alerts: 0, resolved: 0 },
  { name: 'Fri', alerts: 0, resolved: 0 },
  { name: 'Sat', alerts: 0, resolved: 0 },
  { name: 'Sun', alerts: 0, resolved: 0 },
]

const responseTimeData = [
  { name: '00:00', time: 0 },
  { name: '04:00', time: 0 },
  { name: '08:00', time: 0 },
  { name: '12:00', time: 0 },
  { name: '16:00', time: 0 },
  { name: '20:00', time: 0 },
]

interface DashboardStats {
  totalUsers: number
  totalVolunteers: number
  activeEmergencies: number
  todayRegistrations: number
}

export default function AdminDashboardPage() {
  const { alerts } = useEmergencyStore()
  const addAlert = useEmergencyStore((state) => state.addAlert)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVolunteers: 0,
    activeEmergencies: 0,
    todayRegistrations: 0,
  })

  useRealtimeEvents((event) => {
    if (event.type === 'stats-update' && event.data) {
      setDashboardStats(event.data)
    }

    if (
      ['sos-triggered', 'sos-updated', 'sos-cancelled'].includes(event.type) &&
      event.data?.alert
    ) {
      addAlert(event.data.alert)
    }
  })

  useEffect(() => {
    const handleStatsUpdate = (event: CustomEvent<DashboardStats>) => {
      setDashboardStats(event.detail)
    }

    window.addEventListener('stats-updated' as any, handleStatsUpdate as EventListener)

    return () => {
      window.removeEventListener('stats-updated' as any, handleStatsUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      await syncRegisteredUsersWithAdmin()
      const response = await fetch('/api/admin/stats')

      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data.stats)
      }
    }

    fetchStats()
  }, [])

  useEffect(() => {
    const loadEmergencies = async () => {
      try {
        const response = await fetch('/api/admin/emergencies')
        const data = await response.json().catch(() => null)
        if (!response.ok || !Array.isArray(data?.emergencies)) {
          return
        }

        data.emergencies.forEach((alert: any) => addAlert(alert))
      } catch (error) {
        console.warn('Unable to load admin emergencies:', error)
      }
    }

    loadEmergencies()
  }, [addAlert])

  const activeAlerts = alerts.filter((a) => 
    ['pending', 'accepted', 'on_the_way', 'reached'].includes(a.status)
  )
  const activeAlert = activeAlerts.reduce((latest, alert) => {
    if (!latest) return alert
    return new Date(alert.updatedAt).getTime() > new Date(latest.updatedAt).getTime() ? alert : latest
  }, activeAlerts[0] || null)
  const resolvedAlerts = alerts.filter((a) => a.status === 'completed')

  const stats = [
    { 
      label: 'Total Users', 
      value: dashboardStats.totalUsers.toString(), 
      icon: FiUsers, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      change: '0%',
      changeType: 'neutral'
    },
    { 
      label: 'Total Volunteers', 
      value: dashboardStats.totalVolunteers.toString(), 
      icon: FiUserCheck, 
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: '0%',
      changeType: 'neutral'
    },
    { 
      label: 'Active Emergencies', 
      value: Math.max(dashboardStats.activeEmergencies, activeAlerts.length).toString(), 
      icon: FiAlertCircle, 
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: activeAlerts.length > 0 ? 'Active' : 'None',
      changeType: activeAlerts.length > 0 ? 'up' : 'neutral'
    },
    { 
      label: 'Resolved Today', 
      value: resolvedAlerts.length.toString(), 
      icon: FiCheckCircle, 
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      change: '0%',
      changeType: 'neutral'
    },
    { 
      label: 'Cancelled', 
      value: alerts.filter((a) => a.status === 'cancelled').length.toString(), 
      icon: FiArrowDown, 
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '0%',
      changeType: 'neutral'
    },
  ]

  const statusCounts = {
    pending: alerts.filter((a) => a.status === 'pending').length,
    accepted: alerts.filter((a) => a.status === 'accepted').length,
    on_the_way: alerts.filter((a) => a.status === 'on_the_way').length,
    reached: alerts.filter((a) => a.status === 'reached').length,
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage the SafeHer platform
        </p>
      </motion.div>

      {/* Live Stats */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AdminDashboardStats />
        </motion.div>
      </div>

      {/* Emergency tracking counts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Pending', value: statusCounts.pending, color: 'text-yellow-400' },
          { label: 'Accepted', value: statusCounts.accepted, color: 'text-blue-400' },
          { label: 'On The Way', value: statusCounts.on_the_way, color: 'text-purple-400' },
          { label: 'Reached', value: statusCounts.reached, color: 'text-success' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="glass-card rounded-xl p-4"
          >
            <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.changeType !== 'neutral' && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.changeType === 'up' ? 'text-success' : 'text-primary'
                }`}>
                  {stat.changeType === 'up' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              )}
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold">Live Emergency Dispatch</h2>
            <p className="text-sm text-muted-foreground">
              Monitor current active alerts and assigned volunteer details.
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${activeAlert ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-muted-foreground'}`}>
            {activeAlert ? activeAlert.status.replace(/_/g, ' ') : 'No active alerts'}
          </span>
        </div>

        {activeAlert ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="glass-card rounded-2xl p-4 bg-secondary/50 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Active Emergency</p>
              <h3 className="text-xl font-semibold mb-2">{activeAlert.userName}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {activeAlert.latitude.toFixed(4)}, {activeAlert.longitude.toFixed(4)}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Phone:</strong> {activeAlert.userPhone}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Created:</strong> {new Date(activeAlert.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-4 bg-secondary/50 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Assigned Volunteer</p>
              {activeAlert.assignedVolunteerName ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">{activeAlert.assignedVolunteerName}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Volunteer is handling the response and status is currently <strong>{activeAlert.status.replace(/_/g, ' ')}</strong>.
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No volunteer assigned yet. Assign a volunteer from the emergencies page.
                </p>
              )}
              <a
                href={`https://maps.google.com/?q=${activeAlert.latitude},${activeAlert.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                View Location
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active emergency requests at this moment.</p>
        )}
      </motion.div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Alerts Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Weekly Alerts Overview</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary rounded-full" />
                Alerts
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-success rounded-full" />
                Resolved
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="alerts" fill="#FF3B3B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Response Time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Average Response Time</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FiTrendingUp className="w-4 h-4" />
              <span>0 min avg</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} unit=" min" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="time"
                  stroke="#3B82F6"
                  fill="url(#colorTime)"
                />
                <defs>
                  <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Emergency Alerts</h3>
          <Link href="/dashboard/admin/emergencies" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Volunteer</th>
              </tr>
            </thead>
            <tbody>
              {alerts.slice(0, 5).map((alert) => (
                <tr key={alert.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{alert.userName}</p>
                      <p className="text-sm text-muted-foreground">{alert.userPhone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.status === 'completed' 
                        ? 'bg-success/10 text-success' 
                        : alert.status === 'pending'
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {alert.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {alert.assignedVolunteerName || <span className="text-muted-foreground">Unassigned</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
