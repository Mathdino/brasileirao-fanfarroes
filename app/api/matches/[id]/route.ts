import { NextRequest, NextResponse } from 'next/server'
import { getMatch, updateMatchResult, deleteMatch } from '@/lib/match-management'
import { UpdateMatchData } from '@/lib/types'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const match = await getMatch(params.id)
    
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    return NextResponse.json(match)
  } catch (error) {
    console.error('Error fetching match:', error)
    return NextResponse.json({ error: 'Failed to fetch match' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Verificar se é uma atualização de resultado (com goals) ou atualização simples
    if (body.goals !== undefined) {
      // Usar updateMatchResult para atualizações completas
      const updateData: UpdateMatchData = body
      const match = await updateMatchResult(params.id, updateData)
      return NextResponse.json(match)
    } else {
      // Atualização simples apenas de dados básicos
      const updateData: any = {
        homeScore: body.homeScore,
        awayScore: body.awayScore,
        finished: body.finished
      }
      
      // Adicionar matchDate apenas se fornecido
      if (body.matchDate) {
        updateData.matchDate = new Date(body.matchDate)
      }
      
      const match = await prisma.match.update({
        where: { id: params.id },
        data: updateData,
        include: {
          homeTeam: true,
          awayTeam: true,
          goals: {
            include: {
              scorer: true,
              assistant: true,
              team: true
            },
            orderBy: { minute: 'asc' }
          }
        }
      })
      
      return NextResponse.json(match)
    }
  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteMatch(params.id)
    return NextResponse.json({ message: 'Match deleted successfully' })
  } catch (error) {
    console.error('Error deleting match:', error)
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 })
  }
}