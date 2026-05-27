import { NextResponse } from 'next/server'
import { getEmergencies } from '@/lib/admin-state'

export async function GET() {
  try {
    const emergencies = getEmergencies()
    return NextResponse.json({ success: true, emergencies })
  } catch (error) {
    console.error('Failed to fetch admin emergencies:', error)
    return NextResponse.json({ success: false, error: 'Unable to fetch emergencies' }, { status: 500 })
  }
}
