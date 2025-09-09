import { prisma } from './prisma'
import { MatchWithTeams, CreateMatchData, UpdateMatchData, GoalWithPlayer, CardWithPlayer } from './types'

export async function createMatch(data: CreateMatchData): Promise<MatchWithTeams> {
  const match = await prisma.match.create({
    data: {
      homeTeamId: data.homeTeamId,
      awayTeamId: data.awayTeamId,
      matchDate: data.matchDate,
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      goals: {
        include: {
          scorer: true,
          assistant: true,
          team: true
        }
      },
      cards: {
        include: {
          player: true,
          team: true
        }
      }
    }
  })
  
  return match
}

export async function getMatches(): Promise<MatchWithTeams[]> {
  return await prisma.match.findMany({
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
      },
      cards: {
        include: {
          player: true,
          team: true
        },
        orderBy: { minute: 'asc' }
      }
    },
    orderBy: { matchDate: 'desc' }
  })
}

export async function getMatch(id: string): Promise<MatchWithTeams | null> {
  return await prisma.match.findUnique({
    where: { id },
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
      },
      cards: {
        include: {
          player: true,
          team: true
        },
        orderBy: { minute: 'asc' }
      }
    }
  })
}

export async function updateMatchResult(id: string, data: UpdateMatchData): Promise<MatchWithTeams> {
  // Primeiro, remover todos os gols e cartões existentes
  await prisma.goal.deleteMany({
    where: { matchId: id }
  })
  
  await prisma.card.deleteMany({
    where: { matchId: id }
  })
  
  // Atualizar o placar do jogo
  const match = await prisma.match.update({
    where: { id },
    data: {
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      finished: data.finished,
    }
  })
  
  // Criar os novos gols
  if (data.goals && data.goals.length > 0) {
    await prisma.goal.createMany({
      data: data.goals.map(goal => ({
        matchId: id,
        scorerId: goal.scorerId,
        assistantId: goal.assistantId,
        teamId: goal.teamId,
        minute: goal.minute,
      }))
    })
  }
  
  // Criar os novos cartões
  if (data.cards && data.cards.length > 0) {
    await prisma.card.createMany({
      data: data.cards.map(card => ({
        matchId: id,
        playerId: card.playerId,
        teamId: card.teamId,
        type: card.type,
        minute: card.minute,
      }))
    })
  }
  
  return await getMatch(id) as MatchWithTeams
}

export async function deleteMatch(id: string): Promise<void> {
  await prisma.match.delete({
    where: { id }
  })
}

export async function getUpcomingMatches(): Promise<MatchWithTeams[]> {
  return await prisma.match.findMany({
    where: {
      finished: false,
      matchDate: {
        gte: new Date()
      }
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      goals: {
        include: {
          scorer: true,
          assistant: true,
          team: true
        }
      },
      cards: {
        include: {
          player: true,
          team: true
        }
      }
    },
    orderBy: { matchDate: 'asc' }
  })
}

export async function getFinishedMatches(): Promise<MatchWithTeams[]> {
  return await prisma.match.findMany({
    where: { finished: true },
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
      },
      cards: {
        include: {
          player: true,
          team: true
        },
        orderBy: { minute: 'asc' }
      }
    },
    orderBy: { matchDate: 'desc' }
  })
}
