import { NextRequest, NextResponse } from 'next/server'
import { addAdminNotification, recordRegistration } from '@/lib/admin-state'
import { broadcastRealtimeEvent } from '@/lib/realtime-events'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userType = body.userType === 'volunteer' ? 'volunteer' : 'user'
    const { userName, email, phone, id } = body

    const { stats } = recordRegistration(userType, {
      id,
      name: userName,
      email,
      phone,
      role: userType,
      status: 'active',
      lastLoginAt: new Date().toISOString(),
    })
    const notification = addAdminNotification({
      id: `login-${Date.now()}`,
      type: userType === 'volunteer' ? 'volunteer_login' : 'user_login',
      title: `${userType === 'volunteer' ? 'Volunteer' : 'User'} Login`,
      message: `${userName || email} logged in as ${userType}`,
      data: {
        userName,
        email,
        phone,
        timestamp: Date.now(),
      },
    })

    broadcastRealtimeEvent({ type: 'notification', data: notification })
    broadcastRealtimeEvent({ type: 'stats-update', data: stats })

    return NextResponse.json({
      success: true,
      stats,
      notification,
    })
  } catch (error) {
    console.error('Admin login notification error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process login notification',
      },
      { status: 500 }
    )
  }
}
