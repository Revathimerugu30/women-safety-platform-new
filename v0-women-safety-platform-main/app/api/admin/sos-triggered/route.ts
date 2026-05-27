import { NextRequest, NextResponse } from 'next/server'
import { addAdminNotification, recordEmergency } from '@/lib/admin-state'
import { broadcastRealtimeEvent } from '@/lib/realtime-events'
import type { EmergencyAlert } from '@/lib/store'

/**
 * POST /api/admin/sos-triggered
 * Called when a user triggers SOS.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      userName,
      userPhone,
      location,
      emergencyContacts = [],
      emergencyId,
      timestamp,
    } = body

    if (!location?.lat || !location?.lng) {
      return NextResponse.json(
        { success: false, error: 'Missing emergency location' },
        { status: 400 }
      )
    }

    const mapsLink = `https://maps.google.com/?q=${location.lat},${location.lng}`

    console.log('SOS Emergency Alert:', {
      userName,
      userPhone,
      location,
      mapsLink,
      timestamp: new Date().toISOString(),
    })

    const alert: EmergencyAlert = {
      id: emergencyId || `EM-${Date.now()}`,
      userId: userId || userPhone || userName || 'unknown-user',
      userName,
      userPhone,
      latitude: location.lat,
      longitude: location.lng,
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
      message: `${userName} has activated emergency SOS. ${assignedVolunteerMessage}Immediate response required.`,
      data: {
        alertId: recordedAlert.id,
        userName,
        phone: userPhone,
        location,
        timestamp: Date.now(),
      },
    })

    broadcastRealtimeEvent({ type: 'notification', data: notification })
    broadcastRealtimeEvent({ type: 'sos-triggered', data: { notification, alert: recordedAlert, stats } })
    broadcastRealtimeEvent({ type: 'stats-update', data: stats })

    for (const contact of emergencyContacts) {
      await sendEmergencySMS(contact.phone, userName, location, request.nextUrl.origin)
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
    console.error('SOS notification error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process SOS alert',
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
        message: `EMERGENCY ALERT!\n\n${userName} may be in danger.\n\nLive Location:\n${mapsLink}\n\nPlease respond immediately!`,
      }),
    })
  } catch (error) {
    console.error('Error sending emergency SMS:', error)
  }
}
