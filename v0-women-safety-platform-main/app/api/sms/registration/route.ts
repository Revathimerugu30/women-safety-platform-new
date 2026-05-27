import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/sms/registration
 * Sends registration SMS to new users/volunteers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message, userName, userType } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing phone or message' },
        { status: 400 }
      );
    }

    console.log(`📱 Registration SMS - ${userType}:`, {
      to: phone,
      userName,
      message: message.substring(0, 50) + '...',
      timestamp: new Date().toISOString(),
    });

    // Try to send via Twilio if configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromNumber) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        const formData = new URLSearchParams();
        formData.append('To', phone);
        formData.append('From', fromNumber);
        formData.append('Body', message);

        const response = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            Authorization:
              'Basic ' +
              Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✓ Registration SMS sent via Twilio:', {
            sid: result.sid,
            status: result.status,
          });

          return NextResponse.json(
            {
              success: true,
              messageId: result.sid,
              provider: 'twilio',
            },
            { status: 200 }
          );
        }
      } catch (twilioError) {
        console.warn('Twilio failed, using mock SMS:', twilioError);
      }
    }

    // Mock SMS (development)
    return NextResponse.json(
      {
        success: true,
        messageId: `mock-reg-${Date.now()}`,
        provider: 'mock',
        note: 'Development mode - SMS not actually sent',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Registration SMS error:', error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to send registration SMS: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
