import { NextRequest, NextResponse } from 'next/server';
import {
  addAdminNotification,
  removeAdminNotificationsByAlertId,
  resolveEmergency,
} from '@/lib/admin-state';
import { broadcastRealtimeEvent } from '@/lib/realtime-events';

/**
 * POST /api/emergency/cancel
 * Handles emergency cancellation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      alertId,
      userId,
      userName,
      userPhone,
      emergencyContacts = [],
      timestamp,
    } = body;

    // Log only non-sensitive event info
    console.log('✓ Emergency cancelled:', {
      alertId,
      userId,
      userName,
      time: new Date(timestamp).toISOString(),
    });

    const { alert: cancelledAlert, stats } = resolveEmergency(
      {
        alertId,
        userId,
        userPhone,
        userName,
      },
      'cancelled'
    );

    if (cancelledAlert) {
      removeAdminNotificationsByAlertId(cancelledAlert.id);

      const cancellationNotification = addAdminNotification({
        id: `sos-cancelled-${Date.now()}`,
        type: 'sos_cancelled',
        title: 'EMERGENCY CANCELLED',
        message: `${userName || 'A user'} has cancelled the emergency alert.`,
        data: {
          alertId: cancelledAlert.id,
          userName,
          phone: userPhone,
          timestamp: Date.now(),
        },
      });

      broadcastRealtimeEvent({
        type: 'notification-removed',
        data: { alertId: cancelledAlert.id },
      });
      broadcastRealtimeEvent({
        type: 'notification',
        data: cancellationNotification,
      });
      broadcastRealtimeEvent({
        type: 'sos-cancelled',
        data: { alert: cancelledAlert, stats },
      });
      broadcastRealtimeEvent({
        type: 'stats-update',
        data: stats,
      });
    }

    for (const contact of emergencyContacts) {
      await sendAllClearSMS(contact.phone, userName, request.nextUrl.origin);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Emergency alert cancelled successfully',
        alert: cancelledAlert,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    // Do not log sensitive data in errors
    console.error('Emergency cancel error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel emergency alert',
      },
      { status: 500 }
    );
  }
}

async function sendAllClearSMS(phone: string, userName: string | undefined, origin: string) {
  try {
    await fetch(new URL('/api/sms/twilio', origin), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
        message: `✅ All clear from ${userName || 'your contact'}. The emergency has been resolved.`,
      }),
    });
  } catch (error) {
    console.warn('All-clear SMS send failed:', error);
  }
}
