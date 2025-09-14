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
  // Buscar todos os jogadores com seus gols e incluir informações da partida para verificar se o jogo existe
  const playersWithGoals = await prisma.player.findMany({
    include: {
      team: true,
      goals: {
        include: {
          match: true
        }
      }
    }
  })

  // Mapear para o formato de estatísticas e calcular o total de gols por jogador, considerando apenas jogos existentes
  const stats = playersWithGoals
    .map((player: any): PlayerGoalStats => ({
      player,
      team: player.team,
      // Contar apenas gols de jogos que ainda existem no banco de dados
      goals: player.goals.filter((goal: any) => goal.match !== null).length
    }))
    .filter(stat => stat.goals > 0) // Filtrar apenas jogadores que marcaram gols
    .sort((a: PlayerGoalStats, b: PlayerGoalStats) => b.goals - a.goals)
    .slice(0, limit)
  
  return stats
}

export async function getTopAssists(limit: number = 10): Promise<PlayerAssistStats[]> {
  // Buscar todos os jogadores com suas assistências e incluir informações da partida para verificar se o jogo existe
  const playersWithAssists = await prisma.player.findMany({
    include: {
      team: true,
      assists: {
        include: {
          match: true
        }
      }
    }
  })

  // Mapear para o formato de estatísticas e calcular o total de assistências por jogador, considerando apenas jogos existentes
  const stats = playersWithAssists
    .map((player: any): PlayerAssistStats => ({
      player,
      team: player.team,
      // Contar apenas assistências de jogos que ainda existem no banco de dados
      assists: player.assists.filter((assist: any) => assist.match !== null).length
    }))
    .filter(stat => stat.assists > 0) // Filtrar apenas jogadores que deram assistências
    .sort((a: PlayerAssistStats, b: PlayerAssistStats) => b.assists - a.assists)
    .slice(0, limit)
  
  return stats
}

export async function getTopGoalkeepers(limit: number = 10): Promise<GoalkeeperStats[]> {
  // Buscar todos os goleiros com seus times
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
    // Buscar todas as partidas do time do goleiro que ainda existem no banco de dados
    const homeMatches = await prisma.match.findMany({
      where: {
        homeTeamId: goalkeeper.teamId
      }
    })

    const awayMatches = await prisma.match.findMany({
      where: {
        awayTeamId: goalkeeper.teamId
      }
    })

    // Contar partidas finalizadas
    const finishedHomeMatches = homeMatches.filter(match => match.finished).length
    const finishedAwayMatches = awayMatches.filter(match => match.finished).length
    const matchesPlayed = finishedHomeMatches + finishedAwayMatches

    // Calcular gols sofridos
    const homeGoalsAgainst = homeMatches
      .filter(match => match.finished)
      .reduce((sum, match) => sum + (match.awayScore || 0), 0)

    const awayGoalsAgainst = awayMatches
      .filter(match => match.finished)
      .reduce((sum, match) => sum + (match.homeScore || 0), 0)

    const goalsAgainst = homeGoalsAgainst + awayGoalsAgainst

    // Contar jogos sem sofrer gols (clean sheets)
    const homeCleanSheets = homeMatches
      .filter(match => match.finished && match.awayScore === 0)
      .length

    const awayCleanSheets = awayMatches
      .filter(match => match.finished && match.homeScore === 0)
      .length

    const cleanSheets = homeCleanSheets + awayCleanSheets

    // Adicionar todos os goleiros, mesmo que não tenham jogado partidas
    allGoalkeeperStats.push({
      player: goalkeeper,
      team: goalkeeper.team,
      goalsAgainst,
      cleanSheets,
      matchesPlayed
    })
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
      // Tratar casos onde matchesPlayed é zero
      const currentAvg = stat.matchesPlayed > 0 ? stat.goalsAgainst / stat.matchesPlayed : Infinity
      const existingAvg = existing.matchesPlayed > 0 ? existing.goalsAgainst / existing.matchesPlayed : Infinity
      
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
      // Se nenhum jogou partidas, manter a ordem original
      if (a.matchesPlayed === 0 && b.matchesPlayed === 0) {
        return 0
      }
      
      // Priorizar goleiros que jogaram partidas
      if (a.matchesPlayed === 0) return 1
      if (b.matchesPlayed === 0) return -1
      
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
  // Buscar todos os jogadores com seus cartões e incluir informações da partida para verificar se o jogo existe
  const playersWithCards = await prisma.player.findMany({
    include: {
      team: true,
      cards: {
        include: {
          match: true
        }
      }
    }
  })

  // Mapear para o formato de estatísticas e calcular o total de cartões por jogador, considerando apenas jogos existentes
  const stats = playersWithCards
    .map((player: any): PlayerCardStats => {
      // Filtrar apenas cartões de jogos que ainda existem no banco de dados
      const validCards = player.cards.filter((card: any) => card.match !== null)
      const yellowCards = validCards.filter((card: any) => card.type === 'YELLOW').length
      const redCards = validCards.filter((card: any) => card.type === 'RED').length
      const totalCards = yellowCards + redCards
      
      return {
        player,
        team: player.team,
        yellowCards,
        redCards,
        totalCards
      }
    })
    .filter(stat => stat.totalCards > 0) // Filtrar apenas jogadores que receberam cartões
    .sort((a: PlayerCardStats, b: PlayerCardStats) => {
      // Primeiro ordenar por cartões vermelhos, depois amarelos, depois total
      if (b.redCards !== a.redCards) return b.redCards - a.redCards
      if (b.yellowCards !== a.yellowCards) return b.yellowCards - a.yellowCards
      return b.totalCards - a.totalCards
    })
    .slice(0, limit)
  
  return stats
}