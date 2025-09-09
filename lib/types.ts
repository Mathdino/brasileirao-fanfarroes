import { Team, Player, Match, Goal, Card, Admin } from '@prisma/client'

// Tipos do Prisma estendidos
export type TeamWithPlayers = Team & {
  players: Player[]
  _count?: {
    homeMatches: number
    awayMatches: number
    goals: number
  }
}

export type MatchWithTeams = Match & {
  homeTeam: Team
  awayTeam: Team
  goals: GoalWithPlayer[]
  cards: CardWithPlayer[]
}

export type GoalWithPlayer = Goal & {
  scorer: Player
  assistant?: Player | null
  team: Team
}

export type CardWithPlayer = Card & {
  player: Player
  team: Team
}

export type PlayerWithStats = Player & {
  team: Team
  _count?: {
    goals: number
    assists: number
    cards: number
  }
}

// Tipos para estatísticas
export interface TeamStats {
  team: Team
  points: number
  games: number
  wins: number
  draws: number
  defeats: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  lastFiveGames: ("W" | "D" | "L")[]
  position: number
}

export interface PlayerGoalStats {
  player: Player
  team: Team
  goals: number
}

export interface PlayerAssistStats {
  player: Player
  team: Team
  assists: number
}

export interface GoalkeeperStats {
  player: Player
  team: Team
  goalsAgainst: number
  cleanSheets: number
  matchesPlayed: number
}

export interface PlayerCardStats {
  player: Player
  team: Team
  yellowCards: number
  redCards: number
  totalCards: number
}

// Tipos para formulários
export interface CreateTeamData {
  name: string
  logo?: string
  players: {
    name: string
    position: string
    number?: number
  }[]
}

export interface CreateMatchData {
  homeTeamId: string
  awayTeamId: string
  matchDate: Date
}

export interface UpdateMatchData {
  homeScore: number
  awayScore: number
  finished: boolean
  goals: {
    scorerId: string
    assistantId?: string
    teamId: string
    minute?: number
  }[]
  cards: {
    playerId: string
    teamId: string
    type: string
    minute?: number
  }[]
}

// Re-exportar tipos do Prisma
export type { Team, Player, Match, Goal, Card, Admin }
