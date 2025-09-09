"use client"
import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { TeamWithPlayers, CreateTeamData } from "@/lib/types"

interface TeamFormProps {
  team?: TeamWithPlayers
  onSubmit: (teamData: CreateTeamData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function TeamForm({ team, onSubmit, onCancel, isLoading }: TeamFormProps) {
  const [name, setName] = useState(team?.name || "")
  const [logo, setLogo] = useState(team?.logo || "")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Nome do time é obrigatório")
      return
    }

    // When editing a team, only send name and logo data to preserve existing players
    if (team) {
      onSubmit({ 
        name: name.trim(), 
        logo: logo.trim() || undefined
      })
    } else {
      // When creating a new team, include empty players array
      onSubmit({ 
        name: name.trim(), 
        logo: logo.trim() || undefined, 
        players: []
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{team ? "Editar Time" : "Adicionar Novo Time"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Time</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Flamengo Fanfarrões"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">URL do Logo</Label>
            <Input
              id="logo"
              type="url"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://exemplo.com/logo.png (opcional)"
            />
            <p className="text-xs text-muted-foreground">Deixe em branco para usar um logo padrão</p>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2">
            <Button type="submit" className="bg-[#007fcc] hover:bg-[#006bb3]" disabled={isLoading}>
              {isLoading ? "Salvando..." : team ? "Atualizar" : "Adicionar"}
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
