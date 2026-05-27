/**
 * Emergency SMS Service
 * Sends SMS alerts to emergency contacts via Twilio or Fast2SMS
 */

interface SMSProvider {
  name: 'twilio' | 'fast2sms' | 'mock';
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  apiKey?: string;
}

interface SMSMessage {
  to: string;
  message: string;
  priority?: 'high' | 'normal' | 'low';
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: number;
}

export class EmergencySMSService {
  private provider: SMSProvider;

  constructor(provider: SMSProvider = { name: 'mock' }) {
    this.provider = provider;
  }

  /**
   * Send emergency SMS via configured provider
   */
  async sendEmergencySMS(
    phoneNumber: string,
    userName: string,
    latitude: number,
    longitude: number,
    additionalMessage?: string
  ): Promise<SMSResponse> {
    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

    const message = `EMERGENCY ALERT!

${userName} may be in danger.

📍 Live Location:
${mapsLink}

Please respond immediately and check on their safety.

Sent via SafeHer Emergency System`;

    const fullMessage = additionalMessage
      ? `${message}\n\nDetails: ${additionalMessage}`
      : message;

    switch (this.provider.name) {
      case 'twilio':
        return this.sendViaTwilio(phoneNumber, fullMessage);
      case 'fast2sms':
        return this.sendViaFast2SMS(phoneNumber, fullMessage);
      case 'mock':
      default:
        return this.sendMockSMS(phoneNumber, fullMessage);
    }
  }

  /**
   * Send SMS via Twilio
   * Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
   */
  private async sendViaTwilio(
    phoneNumber: string,
    message: string
  ): Promise<SMSResponse> {
    try {
      const response = await fetch('/api/sms/twilio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || 'Failed to send SMS via Twilio',
          timestamp: Date.now(),
        };
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.messageId || data.sid,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Twilio SMS error: ${(error as Error).message}`,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Send SMS via Fast2SMS
   * Requires: FAST2SMS_API_KEY
   */
  private async sendViaFast2SMS(
    phoneNumber: string,
    message: string
  ): Promise<SMSResponse> {
    try {
      const response = await fetch('/api/sms/fast2sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || 'Failed to send SMS via Fast2SMS',
          timestamp: Date.now(),
        };
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.request_id,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Fast2SMS error: ${(error as Error).message}`,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Mock SMS for development/testing
   */
  private async sendMockSMS(
    phoneNumber: string,
    message: string
  ): Promise<SMSResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('📱 Mock SMS Alert Sent:', {
      to: phoneNumber,
      message,
      timestamp: new Date().toISOString(),
    });

    // In development, show the SMS in a toast notification
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('sms-sent', {
        detail: {
          phone: phoneNumber,
          message,
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(event);
    }

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      timestamp: Date.now(),
    };
  }

  /**
   * Send SMS to multiple contacts
   */
  async sendEmergencySMSBulk(
    contacts: Array<{ phone: string; name: string }>,
    userName: string,
    latitude: number,
    longitude: number,
    additionalMessage?: string
  ): Promise<SMSResponse[]> {
    const responses = await Promise.all(
      contacts.map((contact) =>
        this.sendEmergencySMS(
          contact.phone,
          userName,
          latitude,
          longitude,
          additionalMessage
        )
      )
    );

    return responses;
  }

  /**
   * Verify phone number format
   */
  static isValidPhoneNumber(phone: string): boolean {
    // Remove common formatting characters
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    // Check if it's a valid phone number (at least 10 digits)
    return /^\+?1?\d{9,15}$/.test(cleaned);
  }

  /**
   * Format phone number to E.164 format for international SMS
   */
  static formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Add country code if missing (assuming US)
    if (!cleaned.startsWith('+') && !cleaned.startsWith('1')) {
      cleaned = '+1' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }
}

export default EmergencySMSService;
