import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { playerId, assistPlayerId, minute, teamId } = body
    
    const goal = await prisma.goal.update({
      where: { id: params.id },
      data: {
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
    const goals = await prisma.goal.findMany({
      where: { matchId: goal.matchId }
    })
    
    const match = await prisma.match.findUnique({
      where: { id: goal.matchId }
    })
    
    if (match) {
      const homeGoals = goals.filter(g => g.teamId === match.homeTeamId).length
      const awayGoals = goals.filter(g => g.teamId === match.awayTeamId).length

      await prisma.match.update({
        where: { id: goal.matchId },
        data: {
          homeScore: homeGoals,
          awayScore: awayGoals
        }
      })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const goal = await prisma.goal.findUnique({
      where: { id: params.id }
    })
    
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    await prisma.goal.delete({
      where: { id: params.id }
    })

    // Update match score
    const remainingGoals = await prisma.goal.findMany({
      where: { matchId: goal.matchId }
    })
    
    const match = await prisma.match.findUnique({
      where: { id: goal.matchId }
    })
    
    if (match) {
      const homeGoals = remainingGoals.filter(g => g.teamId === match.homeTeamId).length
      const awayGoals = remainingGoals.filter(g => g.teamId === match.awayTeamId).length

      await prisma.match.update({
        where: { id: goal.matchId },
        data: {
          homeScore: homeGoals,
          awayScore: awayGoals
        }
      })
    }

    return NextResponse.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}