import { NextResponse } from 'next/server'
import { getTeamStats } from '@/lib/team-management'

export async function GET() {
  try {
    const stats = await getTeamStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching team statistics:', error)
    return NextResponse.json({ error: 'Failed to fetch team statistics' }, { status: 500 })
  }
}