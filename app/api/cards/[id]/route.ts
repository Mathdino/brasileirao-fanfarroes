import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { playerId, teamId, type, minute } = body
    
    if (!['YELLOW', 'RED'].includes(type)) {
      return NextResponse.json({ 
        error: 'Card type must be YELLOW or RED' 
      }, { status: 400 })
    }
    
    const card = await prisma.card.update({
      where: { id: params.id },
      data: {
        playerId,
        teamId,
        type,
        minute: minute ? parseInt(minute) : null
      },
      include: {
        player: true,
        team: true
      }
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error updating card:', error)
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.card.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting card:', error)
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 })
  }
}