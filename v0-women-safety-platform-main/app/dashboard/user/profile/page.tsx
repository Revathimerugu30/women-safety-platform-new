'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUser(formData)
    setIsEditing(false)
    toast.success('Profile updated successfully')
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information
        </p>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card rounded-2xl p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <FiUser className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-full">
                User
              </span>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all flex items-center gap-2"
            >
              <FiEdit2 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {/* Profile form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiUser className="w-4 h-4 text-muted-foreground" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            ) : (
              <p className="px-4 py-3 bg-secondary/50 rounded-lg">{user?.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiMail className="w-4 h-4 text-muted-foreground" />
              Email Address
            </label>
            <p className="px-4 py-3 bg-secondary/50 rounded-lg text-muted-foreground">
              {user?.email}
              <span className="text-xs ml-2">(Cannot be changed)</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiPhone className="w-4 h-4 text-muted-foreground" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            ) : (
              <p className="px-4 py-3 bg-secondary/50 rounded-lg">{user?.phone || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-muted-foreground" />
              Address
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            ) : (
              <p className="px-4 py-3 bg-secondary/50 rounded-lg">{user?.address || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiPhone className="w-4 h-4 text-muted-foreground" />
              Emergency Contact
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            ) : (
              <p className="px-4 py-3 bg-secondary/50 rounded-lg">{user?.emergencyContact || 'Not set'}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    address: user?.address || '',
                    emergencyContact: user?.emergencyContact || '',
                  })
                }}
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all flex items-center gap-2"
              >
                <FiX className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  )
}
