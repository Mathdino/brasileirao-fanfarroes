import { prisma } from './prisma'
import { TeamWithPlayers, CreateTeamData, TeamStats } from './types'

export async function createTeam(data: CreateTeamData): Promise<TeamWithPlayers> {
  const team = await prisma.team.create({
    data: {
      name: data.name,
      logo: data.logo,
      players: {
        create: data.players.map(player => ({
          name: player.name,
          position: player.position,
          number: player.number,
        }))
      }
    },
    include: {
      players: true
    }
  })
  
  return team
}

export async function getTeams(): Promise<TeamWithPlayers[]> {
  return await prisma.team.findMany({
    include: {
      players: {
        orderBy: [{ number: 'asc' }, { name: 'asc' }]
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function getTeam(id: string): Promise<TeamWithPlayers | null> {
  return await prisma.team.findUnique({
    where: { id },
    include: {
      players: {
        orderBy: [{ number: 'asc' }, { name: 'asc' }]
      }
    }
  })
}

export async function updateTeam(id: string, data: Partial<CreateTeamData>): Promise<TeamWithPlayers> {
  const { players, ...teamData } = data
  
  // Atualizar dados do time
  const team = await prisma.team.update({
    where: { id },
    data: teamData,
    include: {
      players: true
    }
  })
  
  // Se players foram fornecidos, atualizar jogadores
  if (players) {
    // Remover jogadores existentes
    await prisma.player.deleteMany({
      where: { teamId: id }
    })
    
    // Criar novos jogadores
    await prisma.player.createMany({
      data: players.map(player => ({
        ...player,
        teamId: id
      }))
    })
  }
  
  return await getTeam(id) as TeamWithPlayers
}

export async function deleteTeam(id: string): Promise<void> {
  await prisma.team.delete({
    where: { id }
  })
}

export async function getTeamStats(): Promise<TeamStats[]> {
  const teams = await prisma.team.findMany({
    include: {
      homeMatches: {
        where: { finished: true },
        include: {
          goals: true,
          awayTeam: true
        }
      },
      awayMatches: {
        where: { finished: true },
        include: {
          goals: true,
          homeTeam: true
        }
      },
      goals: true
    }
  })
  
  const stats: TeamStats[] = teams.map((team: any) => {
    let points = 0
    let wins = 0
    let draws = 0
    let defeats = 0
    let goalsFor = 0
    let goalsAgainst = 0
    const lastFiveGames: ("W" | "D" | "L")[] = []
    
    const allMatches = [
      ...team.homeMatches.map((match: any) => ({ ...match, isHome: true })),
      ...team.awayMatches.map((match: any) => ({ ...match, isHome: false }))
    ].sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
    
    allMatches.forEach((match, index) => {
      const teamScore = match.isHome ? match.homeScore : match.awayScore
      const opponentScore = match.isHome ? match.awayScore : match.homeScore
      
      goalsFor += teamScore
      goalsAgainst += opponentScore
      
      let result: "W" | "D" | "L"
      if (teamScore > opponentScore) {
        wins++
        points += 3
        result = "W"
      } else if (teamScore === opponentScore) {
        draws++
        points += 1
        result = "D"
      } else {
        defeats++
        result = "L"
      }
      
      if (index < 5) {
        lastFiveGames.push(result)
      }
    })
    
    return {
      team,
      points,
      games: allMatches.length,
      wins,
      draws,
      defeats,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      lastFiveGames,
      position: 0 // Será calculado depois da ordenação
    }
  })
  
  // Ordenar por pontos, saldo de gols, gols marcados
  stats.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })
  
  // Definir posições
  stats.forEach((stat, index) => {
    stat.position = index + 1
  })
  
  return stats
}
