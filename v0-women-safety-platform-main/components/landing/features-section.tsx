'use client'

import { motion } from 'framer-motion'
import { 
  FiAlertCircle, 
  FiNavigation, 
  FiUsers, 
  FiShield, 
  FiBell, 
  FiClock,
  FiMap,
  FiPhone
} from 'react-icons/fi'

const features = [
  {
    icon: FiAlertCircle,
    title: 'One-Click SOS',
    description: 'Instantly alert nearby volunteers and emergency contacts with a single tap. No complex steps during emergencies.',
    color: 'text-primary',
  },
  {
    icon: FiNavigation,
    title: 'Live Location Sharing',
    description: 'Share your real-time GPS location with trusted contacts and responding volunteers automatically.',
    color: 'text-blue-400',
  },
  {
    icon: FiUsers,
    title: 'Verified Volunteers',
    description: 'Connect with a network of verified volunteers who are trained and ready to assist in emergencies.',
    color: 'text-success',
  },
  {
    icon: FiShield,
    title: 'Safe Zones',
    description: 'Discover nearby safe locations including hospitals, police stations, and verified safe spaces.',
    color: 'text-yellow-400',
  },
  {
    icon: FiBell,
    title: 'Real-time Alerts',
    description: 'Receive instant notifications about emergency status updates and volunteer responses.',
    color: 'text-purple-400',
  },
  {
    icon: FiClock,
    title: 'Fast Response',
    description: 'Average response time under 5 minutes with our coordinated volunteer network.',
    color: 'text-orange-400',
  },
  {
    icon: FiMap,
    title: 'Interactive Maps',
    description: 'View nearby emergency services, volunteers, and navigate to safe locations easily.',
    color: 'text-cyan-400',
  },
  {
    icon: FiPhone,
    title: 'Emergency Contacts',
    description: 'Manage trusted contacts who are automatically notified during emergencies.',
    color: 'text-pink-400',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold mb-2 block">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for Safety
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive safety features designed to protect and assist women in any emergency situation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all group"
            >
              <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
