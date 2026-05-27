'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FiHeart, 
  FiUser, 
  FiMail, 
  FiLock, 
  FiPhone, 
  FiMapPin, 
  FiEye, 
  FiEyeOff, 
  FiArrowLeft,
  FiBriefcase,
  FiToggleRight
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store'
import { syncRegisteredUsersWithAdmin } from '@/lib/admin-sync-client'

export default function VolunteerRegisterPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    skills: '',
    availability: true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create volunteer and login directly (no email verification as per requirements)
      const newVolunteer = {
        id: Math.random().toString(36).substr(2, 9),
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        skills: formData.skills,
        availability: formData.availability,
        role: 'volunteer' as const,
        createdAt: new Date().toISOString(),
      }

      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      if (users.some((u: any) => u.email === formData.email)) {
        toast.error('Account with this email already exists!')
        setIsLoading(false)
        return
      }

      users.push(newVolunteer)
      localStorage.setItem('registeredUsers', JSON.stringify(users))

      // Send registration SMS
      try {
        await fetch('/api/sms/registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: formData.phone,
            userName: formData.name,
            userType: 'volunteer',
            message: `Welcome to SafeHer Volunteer Network! Your account has been created successfully. Skills: ${formData.skills}. You will receive emergency alerts.`,
          }),
        })
      } catch (smsError) {
        console.log('SMS error (non-blocking):', smsError)
      }

      // Notify admin
      try {
        const notifyResponse = await fetch('/api/admin/user-registered', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newVolunteer.id,
            userName: formData.name,
            email: formData.email,
            phone: formData.phone,
            userType: 'volunteer',
          }),
        })

        if (notifyResponse.ok) {
          const notifyData = await notifyResponse.json()

          if (notifyData?.stats) {
            window.dispatchEvent(
              new CustomEvent('stats-updated', {
                detail: notifyData.stats,
              })
            )
          }

          if (notifyData?.notification) {
            window.dispatchEvent(
              new CustomEvent('admin-notification', {
                detail: notifyData.notification,
              })
            )
          }
        }
      } catch (notifyError) {
        console.log('Admin notification error (non-blocking):', notifyError)
      }

      await syncRegisteredUsersWithAdmin()

      login({ ...newVolunteer, password: undefined })
      toast.success('Volunteer account created successfully!')
      router.push('/dashboard/volunteer')
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-green-500/5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="glass-card rounded-2xl p-8">
          {/* Back link */}
          <Link
            href="/auth/create-account"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiHeart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Volunteer Registration</h1>
            <p className="text-muted-foreground mt-2">
              Join our network to help women in emergencies
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-input rounded-lg border border-border focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-input rounded-lg border border-border focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-input rounded-lg border border-border focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-input rounded-lg border border-border focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your address"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-input rounded-lg border border-border focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Skills</label>
              <div className="relative">
                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g., First Aid, Self Defense, Counseling"
                  className="w-full pl-10 pr-4 py-3 bg-input rounded-lg border border-border focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-input rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <FiToggleRight className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Available for Emergencies</p>
                  <p className="text-sm text-muted-foreground">Receive emergency alerts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, availability: !formData.availability })}
                className={`w-12 h-6 rounded-full transition-all ${
                  formData.availability ? 'bg-green-500' : 'bg-muted'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-all ${
                    formData.availability ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Creating Account...' : 'Become a Volunteer'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-green-400 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
