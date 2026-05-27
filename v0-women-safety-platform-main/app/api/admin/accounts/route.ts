import { NextResponse } from 'next/server'
import { getAdminStats, getRegisteredAccounts } from '@/lib/admin-state'

export async function GET() {
  return NextResponse.json({
    success: true,
    accounts: getRegisteredAccounts(),
    stats: getAdminStats(),
  })
}
