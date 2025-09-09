import { prisma } from './prisma'
import { PlayerGoalStats, PlayerAssistStats, GoalkeeperStats, PlayerCardStats, Player, Team } from './types'

type PlayerWithTeamAndCards = Player & {
  team: Team
  _count: {
    cards: number
  }
}

type PlayerWithTeamAndGoals = Player & {
  team: Team
  _count: {
    goals: number
  }
}

type PlayerWithTeamAndAssists = Player & {
  team: Team
  _count: {
    assists: number
  }
}

export async function getTopScorers(limit: number = 10): Promise<PlayerGoalStats[]> {
  const playersWithGoals = await prisma.player.findMany({
    include: {
      team: true,
      _count: {
        select: { goals: true }
      }
    }
  })

  return playersWithGoals
    .map((player: PlayerWithTeamAndGoals): PlayerGoalStats => ({
      player,
      team: player.team,
      goals: player._count.goals
    }))
    .filter((stat: PlayerGoalStats) => stat.goals > 0)
    .sort((a: PlayerGoalStats, b: PlayerGoalStats) => b.goals - a.goals)
    .slice(0, limit)
}

export async function getTopAssists(limit: number = 10): Promise<PlayerAssistStats[]> {
  const playersWithAssists = await prisma.player.findMany({
    include: {
      team: true,
      _count: {
        select: { assists: true }
      }
    }
  })

  return playersWithAssists
    .map((player: PlayerWithTeamAndAssists): PlayerAssistStats => ({
      player,
      team: player.team,
      assists: player._count.assists
    }))
    .filter((stat: PlayerAssistStats) => stat.assists > 0)
    .sort((a: PlayerAssistStats, b: PlayerAssistStats) => b.assists - a.assists)
    .slice(0, limit)
}

export async function getTopGoalkeepers(limit: number = 10): Promise<GoalkeeperStats[]> {
  // Buscar goleiros (assumindo que a posição seja "Goleiro")
  const goalkeepers = await prisma.player.findMany({
    where: {
      position: 'Goleiro'
    },
    include: {
      team: true
    }
  })

  const allGoalkeeperStats: GoalkeeperStats[] = []

  for (const goalkeeper of goalkeepers) {
    // Contar partidas jogadas como mandante ou visitante
    const homeMatches = await prisma.match.count({
      where: {
        homeTeamId: goalkeeper.teamId,
        finished: true
      }
    })

    const awayMatches = await prisma.match.count({
      where: {
        awayTeamId: goalkeeper.teamId,
        finished: true
      }
    })

    const matchesPlayed = homeMatches + awayMatches

    // Somar gols sofridos
    const homeGoalsAgainst = await prisma.match.aggregate({
      where: {
        homeTeamId: goalkeeper.teamId,
        finished: true
      },
      _sum: {
        awayScore: true
      }
    })

    const awayGoalsAgainst = await prisma.match.aggregate({
      where: {
        awayTeamId: goalkeeper.teamId,
        finished: true
      },
      _sum: {
        homeScore: true
      }
    })

    const goalsAgainst = (homeGoalsAgainst._sum.awayScore || 0) + (awayGoalsAgainst._sum.homeScore || 0)

    // Contar jogos sem sofrer gols (clean sheets)
    const homeCleanSheets = await prisma.match.count({
      where: {
        homeTeamId: goalkeeper.teamId,
        finished: true,
        awayScore: 0
      }
    })

    const awayCleanSheets = await prisma.match.count({
      where: {
        awayTeamId: goalkeeper.teamId,
        finished: true,
        homeScore: 0
      }
    })

    const cleanSheets = homeCleanSheets + awayCleanSheets

    if (matchesPlayed > 0) {
      allGoalkeeperStats.push({
        player: goalkeeper,
        team: goalkeeper.team,
        goalsAgainst,
        cleanSheets,
        matchesPlayed
      })
    }
  }

  // Agrupar por time e selecionar apenas o melhor goleiro de cada time (menor número de gols sofridos)
  const bestGoalkeeperByTeam = new Map<string, GoalkeeperStats>()

  for (const stat of allGoalkeeperStats) {
    const teamId = stat.team.id
    const existing = bestGoalkeeperByTeam.get(teamId)
    
    if (!existing) {
      bestGoalkeeperByTeam.set(teamId, stat)
    } else {
      // Comparar por menor número de gols sofridos, depois por média de gols por jogo
      const currentAvg = stat.goalsAgainst / stat.matchesPlayed
      const existingAvg = existing.goalsAgainst / existing.matchesPlayed
      
      if (stat.goalsAgainst < existing.goalsAgainst || 
          (stat.goalsAgainst === existing.goalsAgainst && currentAvg < existingAvg) ||
          (stat.goalsAgainst === existing.goalsAgainst && currentAvg === existingAvg && stat.cleanSheets > existing.cleanSheets)) {
        bestGoalkeeperByTeam.set(teamId, stat)
      }
    }
  }

  // Converter para array e ordenar por menor número de gols sofridos
  const bestGoalkeepers = Array.from(bestGoalkeeperByTeam.values())
    .sort((a, b) => {
      // Primeiro critério: menor número total de gols sofridos
      if (a.goalsAgainst !== b.goalsAgainst) {
        return a.goalsAgainst - b.goalsAgainst
      }
      // Segundo critério: menor média de gols sofridos por jogo
      const avgA = a.goalsAgainst / a.matchesPlayed
      const avgB = b.goalsAgainst / b.matchesPlayed
      if (avgA !== avgB) {
        return avgA - avgB
      }
      // Terceiro critério: mais jogos sem sofrer gols (clean sheets)
      return b.cleanSheets - a.cleanSheets
    })
    .slice(0, limit)

  return bestGoalkeepers
}

export async function getPlayerCardStats(limit: number = 10): Promise<PlayerCardStats[]> {
  const playersWithCards = await prisma.player.findMany({
    include: {
      team: true,
      cards: {
        select: {
          type: true
        }
      }
    }
  })

  return playersWithCards
    .map((player: any): PlayerCardStats => {
      const yellowCards = player.cards.filter((card: any) => card.type === 'YELLOW').length
      const redCards = player.cards.filter((card: any) => card.type === 'RED').length
      const totalCards = yellowCards + redCards
      
      return {
        player,
        team: player.team,
        yellowCards,
        redCards,
        totalCards
      }
    })
    .filter((stat: PlayerCardStats) => stat.totalCards > 0)
    .sort((a: PlayerCardStats, b: PlayerCardStats) => {
      // Primeiro ordenar por cartões vermelhos, depois amarelos, depois total
      if (b.redCards !== a.redCards) return b.redCards - a.redCards
      if (b.yellowCards !== a.yellowCards) return b.yellowCards - a.yellowCards
      return b.totalCards - a.totalCards
    })
    .slice(0, limit)
}