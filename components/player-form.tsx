"use client"
import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Player } from "@/lib/types"

interface PlayerFormProps {
  player?: any
  teamId: string
  onSubmit: (playerData: {
    name: string
    position: string
    number?: number
  }) => void
  onCancel: () => void
  isLoading?: boolean
}

export function PlayerForm({ player, teamId, onSubmit, onCancel, isLoading }: PlayerFormProps) {
  const [name, setName] = useState(player?.name || "")
  const [position, setPosition] = useState(player?.position || "Atacante")
  const [number, setNumber] = useState(player?.number?.toString() || "")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Nome do jogador é obrigatório")
      return
    }

    const playerData = {
      name: name.trim(),
      position,
      ...(number && { number: Number.parseInt(number) }),
    }

    onSubmit(playerData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{player ? "Editar Jogador" : "Adicionar Novo Jogador"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Jogador</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Gabriel Barbosa"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Posição</Label>
            <Select value={position} onValueChange={(value: string) => setPosition(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Goleiro">Goleiro</SelectItem>
                <SelectItem value="Zagueiro">Zagueiro</SelectItem>
                <SelectItem value="Meio-campo">Meio-campo</SelectItem>
                <SelectItem value="Atacante">Atacante</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número da Camisa (opcional)</Label>
            <Input 
              id="number" 
              type="number" 
              min="1" 
              max="99" 
              value={number} 
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Ex: 10"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2">
            <Button type="submit" className="bg-[#007fcc] hover:bg-[#006bb3]" disabled={isLoading}>
              {isLoading ? "Salvando..." : player ? "Atualizar" : "Adicionar"}
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
