import { NextRequest, NextResponse } from 'next/server'
import { createTeam, getTeams } from '@/lib/team-management'
import { CreateTeamData } from '@/lib/types'

export async function GET() {
  try {
    const teams = await getTeams()
    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTeamData = await request.json()
    console.log('Received team data:', body)
    
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // If no players provided, create team with empty players array
    const teamData = {
      ...body,
      players: body.players || []
    }

    console.log('Creating team with Prisma...')
    const team = await createTeam(teamData)
    console.log('Team created successfully:', team)
    
    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json({ 
      error: 'Failed to create team',
      details: error.message 
    }, { status: 500 })
  }
}