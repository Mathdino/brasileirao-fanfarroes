"use client"
import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Match, Team } from "@/lib/types"

interface MatchFormProps {
  match?: any // Using any to avoid type conflicts with status/finished
  teams: Team[]
  onSubmit: (matchData: {
    homeTeamId: string
    awayTeamId: string
    homeScore: number
    awayScore: number
    matchDate: Date
    status: string
  }) => void
  onCancel: () => void
  isLoading?: boolean
}

export function MatchForm({ match, teams, onSubmit, onCancel, isLoading }: MatchFormProps) {
  const [homeTeamId, setHomeTeamId] = useState(match?.homeTeamId || "")
  const [awayTeamId, setAwayTeamId] = useState(match?.awayTeamId || "")
  const [homeScore, setHomeScore] = useState(match?.homeScore?.toString() || "0")
  const [awayScore, setAwayScore] = useState(match?.awayScore?.toString() || "0")
  // Helper function to convert date to datetime-local format in local timezone
  const formatDateForInput = (date: Date) => {
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    return localDate.toISOString().slice(0, 16)
  }
  
  const [matchDate, setMatchDate] = useState(
    match?.matchDate ? formatDateForInput(new Date(match.matchDate)) : "",
  )
  // Convert finished boolean to status string
  const getStatusFromMatch = (match: any) => {
    if (!match) return "scheduled"
    if (match.finished) return "completed"
    // If match date is in the past but not finished, consider it live
    if (new Date(match.matchDate) < new Date()) return "live"
    return "scheduled"
  }
  const [status, setStatus] = useState(getStatusFromMatch(match))
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!homeTeamId || !awayTeamId) {
      setError("Selecione os dois times")
      return
    }

    if (homeTeamId === awayTeamId) {
      setError("Um time não pode jogar contra si mesmo")
      return
    }

    if (!matchDate) {
      setError("Data e hora do jogo são obrigatórias")
      return
    }

    // Fix timezone issue by properly parsing local datetime
    // The datetime-local input returns format: "YYYY-MM-DDTHH:MM"
    // We need to parse this as local time, not UTC
    const [datePart, timePart] = matchDate.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hours, minutes] = timePart.split(':').map(Number)
    
    // Create date in local timezone
    const localDate = new Date(year, month - 1, day, hours, minutes)
    
    const matchData = {
      homeTeamId,
      awayTeamId,
      homeScore: Number.parseInt(homeScore) || 0,
      awayScore: Number.parseInt(awayScore) || 0,
      matchDate: localDate,
      status,
    }

    onSubmit(matchData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{match ? "Editar Jogo" : "Agendar Novo Jogo"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="homeTeam">Time da Casa</Label>
              <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o time da casa" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="awayTeam">Time Visitante</Label>
              <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o time visitante" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="matchDate">Data e Hora do Jogo</Label>
            <Input
              id="matchDate"
              type="datetime-local"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status do Jogo</Label>
            <Select value={status} onValueChange={(value: string) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="live">Ao Vivo</SelectItem>
                <SelectItem value="completed">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(status === "completed" || status === "live") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeScore">Gols - Casa</Label>
                <Input
                  id="homeScore"
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awayScore">Gols - Visitante</Label>
                <Input
                  id="awayScore"
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="bg-[#007fcc] hover:bg-[#006bb3]" disabled={isLoading}>
              {isLoading ? "Salvando..." : match ? "Atualizar" : "Agendar"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
