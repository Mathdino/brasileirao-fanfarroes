import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matchId, playerId, assistPlayerId, minute, teamId } = body
    
    if (!matchId || !playerId || !teamId || minute === undefined) {
      return NextResponse.json({ 
        error: 'Match ID, player ID, team ID and minute are required' 
      }, { status: 400 })
    }

    const goal = await prisma.goal.create({
      data: {
        matchId,
        scorerId: playerId,
        assistantId: assistPlayerId || null,
        teamId,
        minute: parseInt(minute)
      },
      include: {
        scorer: true,
        assistant: true,
        team: true
      }
    })

    // Update match score
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    })
    
    if (match) {
      const goals = await prisma.goal.findMany({
        where: { matchId }
      })
      
      const homeGoals = goals.filter(g => g.teamId === match.homeTeamId).length
      const awayGoals = goals.filter(g => g.teamId === match.awayTeamId).length

      await prisma.match.update({
        where: { id: matchId },
        data: {
          homeScore: homeGoals,
          awayScore: awayGoals
        }
      })
    }

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}