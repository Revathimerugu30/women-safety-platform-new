import { NextRequest, NextResponse } from 'next/server'
import { syncRegisteredAccounts } from '@/lib/admin-state'
import { broadcastRealtimeEvent } from '@/lib/realtime-events'

/**
 * POST /api/admin/sync-users
 * Syncs locally registered demo accounts into the admin counters.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const accounts = Array.isArray(body.users) ? body.users : []

    const stats = syncRegisteredAccounts(
      accounts.map((account: any) => ({
        id: account.id,
        name: account.name,
        email: account.email,
        phone: account.phone,
        address: account.address,
        role: account.role === 'volunteer' ? 'volunteer' : 'user',
        status: account.status || 'active',
        createdAt: account.createdAt,
      }))
    )

    broadcastRealtimeEvent({ type: 'stats-update', data: stats })

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('Admin user sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync users',
      },
      { status: 500 }
    )
  }
}
