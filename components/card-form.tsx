"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TeamWithPlayers, CardWithPlayer } from "@/lib/types"
import { CreditCard, Square, SquareX } from "lucide-react"

interface CardFormProps {
  isOpen: boolean
  onClose: () => void
  matchId: string
  teams: TeamWithPlayers[]
  onSubmit: (cardData: any) => void
  editingCard?: CardWithPlayer | null
}

export function CardForm({ isOpen, onClose, matchId, teams, onSubmit, editingCard }: CardFormProps) {
  const [playerId, setPlayerId] = useState(editingCard?.playerId || "")
  const [teamId, setTeamId] = useState(editingCard?.teamId || "")
  const [type, setType] = useState(editingCard?.type || "")
  const [minute, setMinute] = useState(editingCard?.minute?.toString() || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedTeam = teams.find(team => team.id === teamId)
  const availablePlayers = selectedTeam?.players || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!playerId || !teamId || !type) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        matchId,
        playerId,
        teamId,
        type,
        minute: minute ? parseInt(minute) : null
      })
      
      // Reset form
      setPlayerId("")
      setTeamId("")
      setType("")
      setMinute("")
      onClose()
    } catch (error) {
      console.error('Error submitting card:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCardIcon = (cardType: string) => {
    if (cardType === "YELLOW") {
      return <Square className="w-4 h-4 text-yellow-500 fill-yellow-500" />
    } else if (cardType === "RED") {
      return <SquareX className="w-4 h-4 text-red-500 fill-red-500" />
    }
    return <CreditCard className="w-4 h-4" />
  }

  const getCardBadge = (cardType: string) => {
    if (cardType === "YELLOW") {
      return <Badge className="bg-yellow-500 text-white">Cartão Amarelo</Badge>
    } else if (cardType === "RED") {
      return <Badge className="bg-red-500 text-white">Cartão Vermelho</Badge>
    }
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {editingCard ? "Editar Cartão" : "Adicionar Cartão"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="team">Time</Label>
            <Select value={teamId} onValueChange={setTeamId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o time" />
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

          <div>
            <Label htmlFor="player">Jogador</Label>
            <Select value={playerId} onValueChange={setPlayerId} required disabled={!teamId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o jogador" />
              </SelectTrigger>
              <SelectContent>
                {availablePlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} {player.number && `(#${player.number})`} - {player.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Tipo de Cartão</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YELLOW">
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    Cartão Amarelo
                  </div>
                </SelectItem>
                <SelectItem value="RED">
                  <div className="flex items-center gap-2">
                    <SquareX className="w-4 h-4 text-red-500 fill-red-500" />
                    Cartão Vermelho
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="minute">Minuto (opcional)</Label>
            <Input
              id="minute"
              type="number"
              min="1"
              max="120"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="Ex: 45"
            />
          </div>

          {type && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
              {getCardIcon(type)}
              {getCardBadge(type)}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Salvando..." : editingCard ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}