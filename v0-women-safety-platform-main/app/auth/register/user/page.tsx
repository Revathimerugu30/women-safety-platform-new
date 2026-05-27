'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FiShield, 
  FiUser, 
  FiMail, 
  FiLock, 
  FiPhone, 
  FiMapPin, 
  FiEye, 
  FiEyeOff, 
  FiArrowLeft,
  FiUsers
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store'
import { syncRegisteredUsersWithAdmin } from '@/lib/admin-sync-client'

export default function UserRegisterPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    emergencyContact: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      if (users.some((u: any) => u.email === formData.email)) {
        toast.error('Account with this email already exists!')
        setIsLoading(false)
        return
      }

      // Create user and save to localStorage
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        role: 'user' as const,
        createdAt: new Date().toISOString(),
      }
      users.push(newUser)
      localStorage.setItem('registeredUsers', JSON.stringify(users))

      // Send registration SMS
      try {
        await fetch('/api/sms/registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: formData.phone,
            userName: formData.name,
            userType: 'user',
            message: `Welcome to SafeHer! Your account has been created successfully. Your emergency contact: ${formData.emergencyContact}`,
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
            userName: formData.name,
            email: formData.email,
            phone: formData.phone,
            userType: 'user',
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

      login({ ...newUser, password: undefined })
      toast.success('Account created successfully!')
      router.push('/dashboard/user')
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-blue-500/5" />

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
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiUser className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">User Registration</h1>
            <p className="text-muted-foreground mt-2">
              Create your account to access emergency features
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
                  className="w-full pl-10 pr-4 py-3 bg-input rounded-lg border border-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
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
                  className="w-full pl-10 pr-4 py-3 bg-input rounded-lg border border-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
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
                  className="w-full pl-10 pr-12 py-3 bg-input rounded-lg border border-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
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
                  className="w-full pl-10 pr-4 py-3 bg-input rounded-lg border border-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
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
                  className="w-full pl-10 pr-4 py-3 bg-input rounded-lg border border-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Emergency Contact</label>
              <div className="relative">
                <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="Emergency contact number"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-input rounded-lg border border-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
