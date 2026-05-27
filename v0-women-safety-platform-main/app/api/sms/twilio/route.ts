import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/sms/twilio
 * Sends SMS via Twilio API
 * 
 * Environment variables required:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Twilio credentials are configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('⚠️ Twilio credentials not configured. Using mock SMS.');
      return mockSMSResponse();
    }

    const body = await request.json();
    const { to, message } = body;

    // Validate input
    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    // Send via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append('To', to);
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

    if (!response.ok) {
      const error = await response.json();
        // Do not log sensitive data in errors
        console.error('Twilio error');
      return NextResponse.json(
        { success: false, error: error.message || 'Twilio API error' },
        { status: response.status }
      );
    }

    const result = await response.json();
      // Log only non-sensitive info
      console.log('✓ SMS sent via Twilio:', {
        sid: result.sid,
        status: result.status,
      });

    return NextResponse.json(
      {
        success: true,
        messageId: result.sid,
        status: result.status,
      },
      { status: 200 }
    );
  } catch (error) {
      // Do not log sensitive data in errors
      console.error('SMS error');
    return NextResponse.json(
      {
        success: false,
        error: `Failed to send SMS: ${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Mock SMS response for development
 */
function mockSMSResponse() {
  return NextResponse.json(
    {
      success: true,
      messageId: `mock-${Date.now()}`,
      status: 'queued',
      note: 'Development mode - SMS not sent',
    },
    { status: 200 }
  );
}
