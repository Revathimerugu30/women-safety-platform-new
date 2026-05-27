'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiUser, FiHeart, FiShield, FiArrowRight } from 'react-icons/fi'

const accountTypes = [
  {
    id: 'user',
    title: 'User Registration',
    description: 'Register as a user to access emergency SOS features, live location sharing, and connect with nearby volunteers.',
    icon: FiUser,
    href: '/auth/register/user',
    color: 'from-blue-500 to-cyan-500',
    glowColor: 'glow-blue',
  },
  {
    id: 'volunteer',
    title: 'Volunteer Registration',
    description: 'Join our volunteer network to help women in emergencies. Get notified of nearby incidents and provide assistance.',
    icon: FiHeart,
    href: '/auth/register/volunteer',
    color: 'from-green-500 to-emerald-500',
    glowColor: 'glow-green',
  },
  {
    id: 'admin',
    title: 'Admin Login',
    description: 'Administrative access for monitoring emergencies, managing users, and overseeing platform operations.',
    icon: FiShield,
    href: '/auth/login?role=admin',
    color: 'from-primary to-red-600',
    glowColor: 'glow-red',
  },
]

export default function CreateAccountPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <FiShield className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">SafeHer</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Create Your Account
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Choose how you want to join our safety network. Whether you need protection or want to help others.
          </p>
        </motion.div>

        {/* Account Type Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {accountTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={type.href} className="block h-full">
                <div className={`glass-card rounded-2xl p-6 h-full hover:border-white/20 transition-all duration-300 group relative overflow-hidden`}>
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <type.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">{type.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {type.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-4 transition-all duration-300">
                    <span className={`bg-gradient-to-r ${type.color} bg-clip-text text-transparent`}>
                      {type.id === 'admin' ? 'Login' : 'Register Now'}
                    </span>
                    <FiArrowRight className={`w-4 h-4 text-primary`} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
