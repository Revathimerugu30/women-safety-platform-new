import type { Metadata, Viewport } from 'next'
import { Poppins, Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/next'
import { SOSButton } from '@/components/emergency/sos-button'
import { EmergencyNotification } from '@/components/emergency/emergency-notification'
import './globals.css'

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins'
})

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'SafeHer - Women Safety & Emergency Assistance',
  description: 'Instant emergency assistance platform for women - One-click SOS alerts, real-time location sharing, and nearby volunteer coordination.',
  keywords: ['women safety', 'emergency assistance', 'SOS', 'safety app', 'emergency alert'],
}

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={`${poppins.variable} ${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#22C55E',
                secondary: '#F8FAFC',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF3B3B',
                secondary: '#F8FAFC',
              },
            },
          }}
        />
        {children}
        
        {/* Emergency System Components */}
        <EmergencyNotification />
        <SOSButton 
          userName="User"
          emergencyContacts={[
            { phone: '+1-800-123-4567', name: 'Mom' },
            { phone: '+1-800-987-6543', name: 'Best Friend' }
          ]}
        />
        
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
