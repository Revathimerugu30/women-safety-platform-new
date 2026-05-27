import { NextRequest, NextResponse } from 'next/server'
import { addAdminNotification, recordRegistration } from '@/lib/admin-state'
import { broadcastRealtimeEvent } from '@/lib/realtime-events'

/**
 * POST /api/admin/user-registered
 * Called when a new user or volunteer registers.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userName, email, phone, userType, id } = body
    const normalizedUserType = userType === 'volunteer' ? 'volunteer' : 'user'

    console.log(`New ${normalizedUserType} registered:`, {
      userName,
      email,
      phone,
      timestamp: new Date().toISOString(),
    })

    try {
      await fetch(new URL('/api/sms/registration', request.nextUrl.origin), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          userName,
          userType: normalizedUserType,
          message: 'Welcome to SafeHer! Your account has been created successfully.',
        }),
      })
    } catch (smsError) {
      console.warn('Registration SMS failed (non-blocking):', smsError)
    }

    const { stats, isNewAccount } = recordRegistration(normalizedUserType, {
      id,
      name: userName,
      email,
      phone,
      role: normalizedUserType,
      status: 'active',
      createdAt: new Date().toISOString(),
    })
    const notification = addAdminNotification({
      id: `reg-${Date.now()}`,
      type: normalizedUserType === 'volunteer' ? 'volunteer_registered' : 'user_registered',
      title: `New ${normalizedUserType === 'volunteer' ? 'Volunteer' : 'User'} Registration`,
      message: `${userName} (${email}) registered as ${normalizedUserType}`,
      data: {
        userName,
        email,
        phone,
        timestamp: Date.now(),
      },
    })

    if (isNewAccount) {
      broadcastRealtimeEvent({ type: 'notification', data: notification })
    }
    broadcastRealtimeEvent({ type: 'user-registered', data: { notification, stats } })
    broadcastRealtimeEvent({ type: 'stats-update', data: stats })

    return NextResponse.json(
      {
        success: true,
        message: `${normalizedUserType} registration processed`,
        stats,
        notification,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('User registration notification error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process registration',
      },
      { status: 500 }
    )
  }
}
