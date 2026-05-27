'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore, type UserRole } from '@/lib/store'
import { syncCurrentUserWithAdmin } from '@/lib/admin-sync-client'

const ADMIN_EMAIL = 'admin123@gmail.com'
const ADMIN_PASSWORD = 'Admin@123'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAdminLogin = searchParams.get('role') === 'admin'
  const login = useAuthStore((state) => state.login)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<UserRole>(isAdminLogin ? 'admin' : 'user')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Admin login check
      if (role === 'admin') {
        if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
          login({
            id: 'admin-1',
            email: ADMIN_EMAIL,
            name: 'Admin',
            phone: '',
            address: '',
            role: 'admin',
            createdAt: new Date().toISOString(),
          })
          toast.success('Welcome back, Admin!')
          router.push('/dashboard/admin')
        } else {
          toast.error('Invalid admin credentials')
        }
      } else {
        // Check registered users in localStorage
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
        const foundUser = users.find(
          (u: any) =>
            u.email === formData.email &&
            u.password === formData.password &&
            u.role === role
        )
        if (!foundUser) {
          toast.error('Invalid email or password, or account does not exist.')
          setIsLoading(false)
          return
        }
        await syncCurrentUserWithAdmin(foundUser)
        login({ ...foundUser, password: undefined })
        toast.success(`Welcome back!`)
        router.push(`/dashboard/${role}`)
      }
    } catch {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
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

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiShield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">
              {isAdminLogin ? 'Admin Login' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isAdminLogin
                ? 'Enter your admin credentials'
                : 'Sign in to your account'}
            </p>
          </div>

          {/* Role selector (only for non-admin) */}
          {!isAdminLogin && (
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setRole('volunteer')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  role === 'volunteer'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Volunteer
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
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
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-input rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          {!isAdminLogin && (
            <p className="text-center text-muted-foreground mt-6">
              {"Don't have an account? "}
              <Link href="/auth/create-account" className="text-primary hover:underline font-medium">
                Create Account
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
