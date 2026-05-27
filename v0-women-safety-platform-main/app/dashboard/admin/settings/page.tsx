'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSave, FiBell, FiShield, FiGlobe, FiMail } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platformName: 'SafeHer',
    supportEmail: 'support@safeher.app',
    emergencyHotline: '1800-123-456',
    maxAlertRadius: '5',
    autoAssign: true,
    emailNotifications: true,
    pushNotifications: true,
    soundAlerts: true,
  })

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure platform-wide settings and preferences
        </p>
      </motion.div>

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FiGlobe className="w-5 h-5 text-blue-400" />
          General Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Platform Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Emergency Hotline</label>
            <input
              type="text"
              value={settings.emergencyHotline}
              onChange={(e) => setSettings({ ...settings, emergencyHotline: e.target.value })}
              className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Emergency Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FiShield className="w-5 h-5 text-primary" />
          Emergency Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Max Alert Radius (km)</label>
            <input
              type="number"
              value={settings.maxAlertRadius}
              onChange={(e) => setSettings({ ...settings, maxAlertRadius: e.target.value })}
              className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Volunteers within this radius will receive emergency alerts
            </p>
          </div>
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium">Auto-assign Volunteers</p>
              <p className="text-sm text-muted-foreground">
                Automatically assign nearest available volunteer to emergencies
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoAssign: !settings.autoAssign })}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.autoAssign ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  settings.autoAssign ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FiBell className="w-5 h-5 text-yellow-400" />
          Notification Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FiMail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send email alerts for emergencies</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.emailNotifications ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FiBell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Browser push notifications</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, pushNotifications: !settings.pushNotifications })}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.pushNotifications ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              <FiBell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Sound Alerts</p>
                <p className="text-sm text-muted-foreground">Play sound for emergency alerts</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, soundAlerts: !settings.soundAlerts })}
              className={`w-12 h-6 rounded-full transition-all ${
                settings.soundAlerts ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-all ${
                  settings.soundAlerts ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Save button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <FiSave className="w-5 h-5" />
          Save Settings
        </button>
      </motion.div>
    </div>
  )
}
