import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matchId, playerId, teamId, type, minute } = body
    
    if (!matchId || !playerId || !teamId || !type) {
      return NextResponse.json({ 
        error: 'Match ID, player ID, team ID and card type are required' 
      }, { status: 400 })
    }

    if (!['YELLOW', 'RED'].includes(type)) {
      return NextResponse.json({ 
        error: 'Card type must be YELLOW or RED' 
      }, { status: 400 })
    }

    const card = await prisma.card.create({
      data: {
        matchId,
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

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error('Error creating card:', error)
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const matchId = url.searchParams.get('matchId')
    
    const where = matchId ? { matchId } : {}
    
    const cards = await prisma.card.findMany({
      where,
      include: {
        player: true,
        team: true,
        match: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      },
      orderBy: { minute: 'asc' }
    })

    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching cards:', error)
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
  }
}