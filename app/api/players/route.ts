import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received player data:', body)
    
    if (!body.name || !body.position || !body.teamId) {
      return NextResponse.json({ error: 'Name, position and teamId are required' }, { status: 400 })
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: body.teamId }
    })
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Check for duplicate numbers in the same team
    if (body.number) {
      const existingPlayer = await prisma.player.findFirst({
        where: {
          teamId: body.teamId,
          number: body.number
        }
      })
      
      if (existingPlayer) {
        return NextResponse.json({ error: 'Player number already exists in this team' }, { status: 400 })
      }
    }

    const player = await prisma.player.create({
      data: {
        name: body.name,
        position: body.position,
        number: body.number,
        teamId: body.teamId
      },
      include: {
        team: true
      }
    })
    
    console.log('Player created successfully:', player)
    return NextResponse.json(player, { status: 201 })
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json({ 
      error: 'Failed to create player',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}