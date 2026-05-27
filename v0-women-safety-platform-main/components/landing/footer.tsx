'use client'

import Link from 'next/link'
import { FiShield, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

const footerLinks = {
  Platform: [
    { href: '/about', label: 'About Us' },
    { href: '/safety-resources', label: 'Safety Resources' },
    { href: '/auth/create-account', label: 'Get Started' },
    { href: '/contact', label: 'Contact' },
  ],
  'Account Types': [
    { href: '/auth/register/user', label: 'Register as User' },
    { href: '/auth/register/volunteer', label: 'Become a Volunteer' },
    { href: '/auth/login', label: 'Sign In' },
  ],
  Emergency: [
    { href: 'tel:911', label: 'Call 911' },
    { href: '#', label: 'Emergency Hotlines' },
    { href: '#', label: 'Safety Tips' },
    { href: '#', label: 'Report an Issue' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FiShield className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SafeHer</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Empowering women with instant emergency assistance. 
              Your safety network, always within reach.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="mailto:support@safeher.app" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <FiMail className="w-4 h-4" />
                support@safeher.app
              </a>
              <a href="tel:1800123456" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <FiPhone className="w-4 h-4" />
                1800-123-456
              </a>
              <span className="flex items-center gap-2">
                <FiMapPin className="w-4 h-4" />
                Available Nationwide
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            2024 SafeHer. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
