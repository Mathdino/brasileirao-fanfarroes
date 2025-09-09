import type { Team, Match, Goal, TeamStats, Player } from "../types"

export function calculateTeamStats(teams: Team[], matches: Match[], goals: Goal[]): TeamStats[] {
  return teams
    .map((team) => {
      const teamMatches = matches.filter(
        (match) => (match.homeTeamId === team.id || match.awayTeamId === team.id) && match.status === "completed",
      )

      let points = 0
      let wins = 0
      let draws = 0
      let defeats = 0
      let goalsFor = 0
      let goalsAgainst = 0
      const lastFiveGames: ("W" | "D" | "L")[] = []

      teamMatches.forEach((match) => {
        const isHome = match.homeTeamId === team.id
        const teamScore = isHome ? match.homeScore : match.awayScore
        const opponentScore = isHome ? match.awayScore : match.homeScore

        goalsFor += teamScore
        goalsAgainst += opponentScore

        if (teamScore > opponentScore) {
          points += 3
          wins++
          lastFiveGames.push("W")
        } else if (teamScore === opponentScore) {
          points += 1
          draws++
          lastFiveGames.push("D")
        } else {
          defeats++
          lastFiveGames.push("L")
        }
      })

      return {
        teamId: team.id,
        points,
        games: teamMatches.length,
        wins,
        draws,
        defeats,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        lastFiveGames: lastFiveGames.slice(-5),
      }
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })
}

export function getTopScorers(players: Player[]): Player[] {
  return players
    .filter((player) => player.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10)
}

export function getTopAssists(players: Player[]): Player[] {
  return players
    .filter((player) => player.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 10)
}

export function getBestGoalkeepers(players: Player[]): Player[] {
  return players
    .filter((player) => player.position === "goalkeeper" && player.goalsAgainst !== undefined)
    .sort((a, b) => (a.goalsAgainst || 0) - (b.goalsAgainst || 0))
    .slice(0, 5)
}
