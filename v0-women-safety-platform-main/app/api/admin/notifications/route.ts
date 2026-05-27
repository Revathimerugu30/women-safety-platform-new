import { NextResponse } from 'next/server'
import { getAdminNotifications } from '@/lib/admin-state'

export async function GET() {
  return NextResponse.json({
    success: true,
    notifications: getAdminNotifications(),
  })
}
