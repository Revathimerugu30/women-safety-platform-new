import { NextRequest, NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/admin-state';

/**
 * GET /api/admin/stats
 * Returns real-time admin dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const stats = getAdminStats();

    return NextResponse.json(
      {
        success: true,
        stats,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin stats',
      },
      { status: 500 }
    );
  }
}
