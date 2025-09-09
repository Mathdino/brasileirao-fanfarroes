import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    console.log('Updating player:', params.id, body)
    
    if (!body.name || !body.position) {
      return NextResponse.json({ error: 'Name and position are required' }, { status: 400 })
    }

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { id: params.id }
    })
    
    if (!existingPlayer) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Check for duplicate numbers in the same team (excluding current player)
    if (body.number) {
      const duplicatePlayer = await prisma.player.findFirst({
        where: {
          teamId: existingPlayer.teamId,
          number: body.number,
          id: { not: params.id }
        }
      })
      
      if (duplicatePlayer) {
        return NextResponse.json({ error: 'Player number already exists in this team' }, { status: 400 })
      }
    }

    const player = await prisma.player.update({
      where: { id: params.id },
      data: {
        name: body.name,
        position: body.position,
        number: body.number
      },
      include: {
        team: true
      }
    })
    
    console.log('Player updated successfully:', player)
    return NextResponse.json(player)
  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json({ 
      error: 'Failed to update player',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Deleting player:', params.id)
    
    const player = await prisma.player.findUnique({
      where: { id: params.id }
    })
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    await prisma.player.delete({
      where: { id: params.id }
    })
    
    console.log('Player deleted successfully')
    return NextResponse.json({ message: 'Player deleted successfully' })
  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json({ 
      error: 'Failed to delete player',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}