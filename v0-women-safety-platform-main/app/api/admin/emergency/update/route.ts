import { NextRequest, NextResponse } from 'next/server'
import { addAdminNotification, updateEmergencyStatus, selectAvailableVolunteer } from '@/lib/admin-state'
import { broadcastRealtimeEvent } from '@/lib/realtime-events'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      alertId,
      status,
      assignedVolunteerId,
      assignedVolunteerName,
      userId,
      userName,
      userPhone,
    } = body

    if (!alertId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing alertId or status' },
        { status: 400 }
      )
    }

    let volunteerId = assignedVolunteerId
    let volunteerName = assignedVolunteerName

    if (status === 'accepted' && !volunteerId && !volunteerName) {
      const assignment = selectAvailableVolunteer()
      if (assignment) {
        volunteerId = assignment.id
        volunteerName = assignment.name
      }
    }

    const updateResult = updateEmergencyStatus(alertId, {
      status,
      assignedVolunteerId: volunteerId,
      assignedVolunteerName: volunteerName,
    })

    const updatedAlert = updateResult.alert
    const stats = updateResult.stats

    if (!updatedAlert) {
      return NextResponse.json(
        { success: false, error: 'Emergency alert not found' },
        { status: 404 }
      )
    }

    const notification = addAdminNotification({
      id: `sos-update-${Date.now()}`,
      type: 'sos_updated',
      title: 'Emergency Status Updated',
      message: `${volunteerName || 'A volunteer'} updated the emergency status to ${status.replace(/_/g, ' ')}.`,
      data: {
        alertId: updatedAlert.id,
        userName,
        phone: userPhone,
        location: { lat: updatedAlert.latitude, lng: updatedAlert.longitude },
        timestamp: Date.now(),
      },
    })

    broadcastRealtimeEvent({ type: 'notification', data: notification })
    broadcastRealtimeEvent({ type: 'sos-updated', data: { alert: updatedAlert, stats } })
    broadcastRealtimeEvent({ type: 'stats-update', data: stats })

    return NextResponse.json({ success: true, alert: updatedAlert, stats }, { status: 200 })
  } catch (error) {
    console.error('Emergency update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update emergency status' },
      { status: 500 }
    )
  }
}
