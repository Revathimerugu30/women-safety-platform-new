import { NextRequest, NextResponse } from 'next/server'
import { addAdminNotification, recordEmergency } from '@/lib/admin-state'
import { broadcastRealtimeEvent } from '@/lib/realtime-events'
import type { EmergencyAlert } from '@/lib/store'

/**
 * POST /api/emergency/trigger
 * Handles emergency SOS trigger
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userLocation, emergencyContacts = [], userName, userPhone, userId, timestamp } = body

    if (!userLocation?.lat || !userLocation?.lng) {
      return NextResponse.json(
        { success: false, error: 'Missing emergency location' },
        { status: 400 }
      )
    }

    const emergencyId = `EM-${Date.now()}`
    const mapsLink = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`

    // Log only non-sensitive event info
    console.log('🚨 Emergency triggered:', {
      emergencyId,
      contacts: emergencyContacts.length,
      time: new Date(timestamp).toISOString(),
    })

    const alert: EmergencyAlert = {
      id: emergencyId,
      userId: userId || userPhone || userName || `user-${Date.now()}`,
      userName,
      userPhone,
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      status: 'pending',
      createdAt: new Date(timestamp || Date.now()).toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { alert: recordedAlert, stats } = recordEmergency(alert)
    const assignedVolunteerMessage = recordedAlert.assignedVolunteerName
      ? `Assigned volunteer: ${recordedAlert.assignedVolunteerName}. `
      : ''

    const notification = addAdminNotification({
      id: `sos-${Date.now()}`,
      type: 'sos_triggered',
      title: 'EMERGENCY SOS TRIGGERED',
      message: `${userName || 'A user'} has activated emergency SOS. ${assignedVolunteerMessage}Immediate response required.`,
      data: {
        alertId: recordedAlert.id,
        userName,
        phone: userPhone,
        location: userLocation,
        timestamp: Date.now(),
      },
    })

    broadcastRealtimeEvent({ type: 'notification', data: notification })
    broadcastRealtimeEvent({ type: 'sos-triggered', data: { notification, alert: recordedAlert, stats } })
    broadcastRealtimeEvent({ type: 'stats-update', data: stats })

    for (const contact of emergencyContacts) {
      await sendEmergencySMS(contact.phone, userName, userLocation, request.nextUrl.origin)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'SOS alert sent to admin, volunteers, and emergency contacts',
        mapsLink,
        alert: recordedAlert,
        stats,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Emergency trigger error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger emergency alert',
      },
      { status: 500 }
    )
  }
}

async function sendEmergencySMS(
  phone: string,
  userName: string,
  location: { lat: number; lng: number },
  origin: string
) {
  try {
    const mapsLink = `https://maps.google.com/?q=${location.lat},${location.lng}`

    await fetch(new URL('/api/sms/twilio', origin), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
        message: `EMERGENCY ALERT!\n\n${userName || 'A user'} may be in danger.\n\nLive Location:\n${mapsLink}\n\nPlease respond immediately!`,
      }),
    })
  } catch (error) {
    console.warn('Error sending emergency SMS:', error)
  }
}

