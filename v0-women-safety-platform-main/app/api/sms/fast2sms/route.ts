import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/sms/fast2sms
 * Sends SMS via Fast2SMS API
 * 
 * Environment variables required:
 * - FAST2SMS_API_KEY
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ Fast2SMS API key not configured. Using mock SMS.');
      return mockSMSResponse();
    }

    const body = await request.json();
    const { phone, message } = body;

    // Validate input
    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: phone, message' },
        { status: 400 }
      );
    }

    // Send via Fast2SMS
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        numbers: phone,
        message: message,
        sender_id: 'SAFEHR',
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      // Do not log sensitive data in errors
      console.error('Fast2SMS error');
      return NextResponse.json(
        { success: false, error: error.message || 'Fast2SMS API error' },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (result.return === false) {
      // Do not log sensitive data in errors
      console.error('Fast2SMS failed');
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // Log only non-sensitive info
    console.log('✓ SMS sent via Fast2SMS:', {
      requestId: result.request_id,
    });

    return NextResponse.json(
      {
        success: true,
        messageId: result.request_id,
        message: result.message,
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
      message: 'Development mode - SMS not sent',
    },
    { status: 200 }
  );
}
