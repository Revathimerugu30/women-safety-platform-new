'use client'

import { motion } from 'framer-motion'
import { FiDownload, FiCalendar } from 'react-icons/fi'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

// Empty data - add your own data here
const monthlyData = [
  { name: 'Jan', alerts: 0, resolved: 0 },
  { name: 'Feb', alerts: 0, resolved: 0 },
  { name: 'Mar', alerts: 0, resolved: 0 },
  { name: 'Apr', alerts: 0, resolved: 0 },
  { name: 'May', alerts: 0, resolved: 0 },
  { name: 'Jun', alerts: 0, resolved: 0 },
]

const statusData = [
  { name: 'Resolved', value: 0, color: '#22C55E' },
  { name: 'Active', value: 0, color: '#3B82F6' },
  { name: 'Pending', value: 0, color: '#F59E0B' },
]

const responseTimeData = [
  { name: '<2 min', count: 0 },
  { name: '2-5 min', count: 0 },
  { name: '5-10 min', count: 0 },
  { name: '>10 min', count: 0 },
]

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Platform performance and emergency statistics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all flex items-center gap-2">
            <FiCalendar className="w-4 h-4" />
            Last 6 Months
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2">
            <FiDownload className="w-4 h-4" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Alerts</p>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground">No data yet</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Resolution Rate</p>
          <p className="text-3xl font-bold">0%</p>
          <p className="text-sm text-muted-foreground">No data yet</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg Response Time</p>
          <p className="text-3xl font-bold">0m</p>
          <p className="text-sm text-muted-foreground">No data yet</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Volunteers</p>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground">No data yet</p>
        </div>
      </motion.div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="font-semibold mb-6">Monthly Alert Trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
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
                <Area
                  type="monotone"
                  dataKey="alerts"
                  stackId="1"
                  stroke="#FF3B3B"
                  fill="url(#colorAlerts)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="2"
                  stroke="#22C55E"
                  fill="url(#colorResolved)"
                />
                <defs>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B3B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF3B3B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="font-semibold mb-6">Alert Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Response Time Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="font-semibold mb-6">Response Time Distribution</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={responseTimeData}>
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
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
