/**
 * Registration SMS Service
 * Sends SMS to users upon registration with emergency information
 */

interface RegistrationSMSData {
  userName: string;
  phone: string;
  userType: 'user' | 'volunteer';
  emergencyNumber?: string;
}

export class RegistrationSMSService {
  /**
   * Send registration confirmation SMS
   */
  static async sendRegistrationSMS(data: RegistrationSMSData): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const message = RegistrationSMSService.generateRegistrationMessage(data);

      const response = await fetch('/api/sms/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: data.phone,
          message,
          userName: data.userName,
          userType: data.userType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || 'Failed to send registration SMS',
        };
      }

      const result = await response.json();

      // Trigger notification event
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('admin-notification', {
          detail: {
            id: `sms-${Date.now()}`,
            type: 'sms_sent',
            title: `Registration SMS Sent`,
            message: `${data.userType === 'volunteer' ? 'Volunteer' : 'User'} ${data.userName} registered and SMS sent to ${data.phone}`,
            data: {
              userName: data.userName,
              phone: data.phone,
              timestamp: Date.now(),
            },
          },
        });
        window.dispatchEvent(event);
      }

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: `Registration SMS error: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Generate registration message
   */
  private static generateRegistrationMessage(data: RegistrationSMSData): string {
    if (data.userType === 'volunteer') {
      return `Welcome to SafeHer Volunteer Network! 🚨

Thank you for registering as a verified volunteer.

Your Profile: Active
Status: Ready to respond to emergencies

Download the SafeHer app to:
✓ Respond to emergency alerts
✓ Track emergency situations
✓ Help women in need

Emergency Hotline: 1800-123-456

Thank you for helping keep our community safe!
SafeHer Team`;
    } else {
      return `Welcome to SafeHer! 🛡️

Your emergency account is now active.

Quick Start:
1. Add emergency contacts
2. Set up your profile
3. Tap SOS button in emergency

Emergency Feature:
• One-tap SOS button
• Real-time location sharing
• Nearby volunteer network
• Direct police coordination

Download SafeHer App
Hotline: 1800-123-456

Your safety is our priority.
SafeHer Team`;
    }
  }

  /**
   * Send emergency number registration SMS
   */
  static async sendEmergencyNumberSMS(
    phone: string,
    userName: string,
    emergencyNumber: string
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const message = `SafeHer Security Alert 🔔

Hi ${userName},

Your emergency contact number has been registered:
${emergencyNumber}

This number will receive:
✓ Emergency alerts when you press SOS
✓ Real-time location link
✓ Status updates

If you didn't register this number, 
contact us: support@safeher.app

SafeHer Security Team`;

      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phone,
          message,
          type: 'emergency_number_alert',
        }),
      });

      if (!response.ok) {
        return { success: false };
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Error sending emergency number SMS:', error);
      return { success: false };
    }
  }
}

export default RegistrationSMSService;
