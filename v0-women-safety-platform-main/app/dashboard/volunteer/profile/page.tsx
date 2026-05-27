'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiBriefcase } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store'

export default function VolunteerProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    skills: user?.skills || '',
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
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Volunteer Profile</h1>
        <p className="text-muted-foreground">
          Manage your volunteer information
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
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <FiUser className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
                  Volunteer
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${user?.availability ? 'bg-success/10 text-success' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  {user?.availability ? 'Available' : 'Unavailable'}
                </span>
              </div>
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
                className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-success focus:ring-1 focus:ring-success outline-none transition-all"
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
                className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-success focus:ring-1 focus:ring-success outline-none transition-all"
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
                className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-success focus:ring-1 focus:ring-success outline-none transition-all"
              />
            ) : (
              <p className="px-4 py-3 bg-secondary/50 rounded-lg">{user?.address || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiBriefcase className="w-4 h-4 text-muted-foreground" />
              Skills
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g., First Aid, Self Defense, Counseling"
                className="w-full px-4 py-3 bg-input rounded-lg border border-border focus:border-success focus:ring-1 focus:ring-success outline-none transition-all"
              />
            ) : (
              <p className="px-4 py-3 bg-secondary/50 rounded-lg">{user?.skills || 'Not set'}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-success text-white rounded-lg font-medium hover:bg-success/90 transition-all flex items-center gap-2"
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
                    skills: user?.skills || '',
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
