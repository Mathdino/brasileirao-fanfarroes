import { NextRequest, NextResponse } from 'next/server'
import { createMatch, getMatches } from '@/lib/match-management'
import { CreateMatchData } from '@/lib/types'

export async function GET() {
  try {
    const matches = await getMatches()
    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMatchData = await request.json()
    
    if (!body.homeTeamId || !body.awayTeamId || !body.matchDate) {
      return NextResponse.json({ error: 'Home team, away team and match date are required' }, { status: 400 })
    }

    if (body.homeTeamId === body.awayTeamId) {
      return NextResponse.json({ error: 'Home team and away team cannot be the same' }, { status: 400 })
    }

    const match = await createMatch(body)
    return NextResponse.json(match, { status: 201 })
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 })
  }
}