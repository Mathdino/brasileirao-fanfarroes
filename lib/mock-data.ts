import type { Team, Player, Match, Goal } from "./types"

export const mockTeams: Team[] = [
  {
    id: "1",
    name: "Flamengo Fanfarrões",
    logo: "/flamengo-logo.png",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Palmeiras Fanfarrões",
    logo: "/palmeiras-logo.png",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "São Paulo Fanfarrões",
    logo: "/sao-paulo-logo.png",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    name: "Corinthians Fanfarrões",
    logo: "/corinthians-logo.png",
    createdAt: new Date("2024-01-01"),
  },
]

export const mockPlayers: Player[] = [
  // Flamengo players
  { id: "1", name: "Gabriel Barbosa", position: "forward", teamId: "1", goals: 8, assists: 3 },
  { id: "2", name: "Bruno Henrique", position: "forward", teamId: "1", goals: 5, assists: 4 },
  { id: "3", name: "Arrascaeta", position: "midfielder", teamId: "1", goals: 3, assists: 7 },
  { id: "4", name: "Santos", position: "goalkeeper", teamId: "1", goals: 0, assists: 0, goalsAgainst: 8 },

  // Palmeiras players
  { id: "5", name: "Rony", position: "forward", teamId: "2", goals: 6, assists: 2 },
  { id: "6", name: "Dudu", position: "forward", teamId: "2", goals: 4, assists: 5 },
  { id: "7", name: "Raphael Veiga", position: "midfielder", teamId: "2", goals: 7, assists: 4 },
  { id: "8", name: "Weverton", position: "goalkeeper", teamId: "2", goals: 0, assists: 0, goalsAgainst: 6 },

  // São Paulo players
  { id: "9", name: "Calleri", position: "forward", teamId: "3", goals: 9, assists: 1 },
  { id: "10", name: "Luciano", position: "forward", teamId: "3", goals: 4, assists: 3 },
  { id: "11", name: "Igor Gomes", position: "midfielder", teamId: "3", goals: 2, assists: 6 },
  { id: "12", name: "Rafael", position: "goalkeeper", teamId: "3", goals: 0, assists: 0, goalsAgainst: 10 },

  // Corinthians players
  { id: "13", name: "Yuri Alberto", position: "forward", teamId: "4", goals: 7, assists: 2 },
  { id: "14", name: "Róger Guedes", position: "forward", teamId: "4", goals: 3, assists: 4 },
  { id: "15", name: "Renato Augusto", position: "midfielder", teamId: "4", goals: 1, assists: 8 },
  { id: "16", name: "Cássio", position: "goalkeeper", teamId: "4", goals: 0, assists: 0, goalsAgainst: 12 },
]

export const mockMatches: Match[] = [
  {
    id: "1",
    homeTeamId: "1",
    awayTeamId: "2",
    homeScore: 2,
    awayScore: 1,
    matchDate: new Date("2024-03-15"),
    status: "completed",
  },
  {
    id: "2",
    homeTeamId: "3",
    awayTeamId: "4",
    homeScore: 3,
    awayScore: 1,
    matchDate: new Date("2024-03-16"),
    status: "completed",
  },
  {
    id: "3",
    homeTeamId: "1",
    awayTeamId: "3",
    homeScore: 1,
    awayScore: 2,
    matchDate: new Date("2024-03-22"),
    status: "completed",
  },
  {
    id: "4",
    homeTeamId: "2",
    awayTeamId: "4",
    homeScore: 2,
    awayScore: 0,
    matchDate: new Date("2024-03-23"),
    status: "completed",
  },
  {
    id: "5",
    homeTeamId: "1",
    awayTeamId: "4",
    homeScore: 0,
    awayScore: 0,
    matchDate: new Date("2024-03-30"),
    status: "scheduled",
  },
]

export const mockGoals: Goal[] = [
  // Match 1: Flamengo 2-1 Palmeiras
  { id: "1", matchId: "1", playerId: "1", minute: 25, teamId: "1" },
  { id: "2", matchId: "1", playerId: "5", minute: 45, teamId: "2" },
  { id: "3", matchId: "1", playerId: "2", assistPlayerId: "3", minute: 78, teamId: "1" },

  // Match 2: São Paulo 3-1 Corinthians
  { id: "4", matchId: "2", playerId: "9", minute: 12, teamId: "3" },
  { id: "5", matchId: "2", playerId: "13", minute: 34, teamId: "4" },
  { id: "6", matchId: "2", playerId: "9", assistPlayerId: "10", minute: 56, teamId: "3" },
  { id: "7", matchId: "2", playerId: "10", assistPlayerId: "11", minute: 89, teamId: "3" },

  // Match 3: Flamengo 1-2 São Paulo
  { id: "8", matchId: "3", playerId: "9", minute: 23, teamId: "3" },
  { id: "9", matchId: "3", playerId: "1", assistPlayerId: "3", minute: 67, teamId: "1" },
  { id: "10", matchId: "3", playerId: "10", minute: 85, teamId: "3" },

  // Match 4: Palmeiras 2-0 Corinthians
  { id: "11", matchId: "4", playerId: "7", minute: 31, teamId: "2" },
  { id: "12", matchId: "4", playerId: "6", assistPlayerId: "5", minute: 72, teamId: "2" },
]
