"use client"
import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Goal, Player } from "@/lib/types"

interface GoalFormProps {
  goal?: Goal
  matchId: string
  players: Player[]
  onSubmit: (goalData: { playerId: string; assistPlayerId?: string; minute: number; teamId: string }) => void
  onCancel: () => void
  isLoading?: boolean
}

export function GoalForm({ goal, matchId, players, onSubmit, onCancel, isLoading }: GoalFormProps) {
  const [playerId, setPlayerId] = useState(goal?.playerId || "defaultPlayerId")
  const [assistPlayerId, setAssistPlayerId] = useState(goal?.assistPlayerId || "none")
  const [minute, setMinute] = useState(goal?.minute?.toString() || "")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!playerId || playerId === "defaultPlayerId") {
      setError("Selecione o jogador que marcou o gol")
      return
    }

    if (!minute || Number.parseInt(minute) < 1 || Number.parseInt(minute) > 120) {
      setError("Minuto deve estar entre 1 e 120")
      return
    }

    if (assistPlayerId === playerId && assistPlayerId !== "none") {
      setError("O jogador não pode dar assistência para si mesmo")
      return
    }

    const scorer = players.find((p) => p.id === playerId)
    if (!scorer) {
      setError("Jogador não encontrado")
      return
    }

    const goalData = {
      playerId,
      assistPlayerId: assistPlayerId === "none" ? undefined : assistPlayerId,
      minute: Number.parseInt(minute),
      teamId: scorer.teamId,
    }

    onSubmit(goalData)
  }

  const selectedPlayer = players.find((p) => p.id === playerId)
  const teamPlayers = selectedPlayer ? players.filter((p) => p.teamId === selectedPlayer.teamId) : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{goal ? "Editar Gol" : "Registrar Gol"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {players.length === 0 && (
            <Alert>
              <AlertDescription>
                Nenhum jogador disponível para este jogo. Certifique-se de que os times tenham jogadores cadastrados.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="player">Jogador que marcou</Label>
            <Select value={playerId} onValueChange={setPlayerId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o jogador" />
              </SelectTrigger>
              <SelectContent>
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assist">Assistência (opcional)</Label>
            <Select value={assistPlayerId} onValueChange={setAssistPlayerId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione quem deu a assistência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma assistência</SelectItem>
                {teamPlayers
                  .filter((p) => p.id !== playerId)
                  .map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minute">Minuto do Gol</Label>
            <Input
              id="minute"
              type="number"
              min="1"
              max="120"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="Ex: 45"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="bg-[#007fcc] hover:bg-[#006bb3]" disabled={isLoading}>
              {isLoading ? "Salvando..." : goal ? "Atualizar" : "Registrar"}
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
