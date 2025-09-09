"use client"
import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin-login"
import { AdminHeader } from "@/components/admin-header"
import { TeamForm } from "@/components/team-form"
import { PlayerForm } from "@/components/player-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { isAuthenticated } from "@/lib/auth"
import type { TeamWithPlayers, CreateTeamData } from "@/lib/types"
import { Plus, Edit, Trash2, Users, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function TeamsManagementPage() {
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [teams, setTeams] = useState<TeamWithPlayers[]>([])
  const [selectedTeam, setSelectedTeam] = useState<TeamWithPlayers | null>(null)
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<TeamWithPlayers | null>(null)
  const [editingPlayer, setEditingPlayer] = useState<any>(null)
  const [message, setMessage] = useState("")

  const loadTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const teamsData = await response.json()
        setTeams(teamsData)
      } else {
        console.error('Failed to fetch teams:', response.statusText)
        setTeams([])
      }
    } catch (error) {
      console.error('Error loading teams:', error)
      setTeams([])
    }
  }

  useEffect(() => {
    setIsAuth(isAuthenticated())
    setIsLoading(false)
    if (isAuthenticated()) {
      loadTeams()
    }
  }, [])

  const handleLogin = () => {
    setIsAuth(true)
    loadTeams()
  }

  const handleLogout = () => {
    setIsAuth(false)
    setSelectedTeam(null)
    setShowTeamForm(false)
    setShowPlayerForm(false)
  }

  const handleTeamSubmit = async (teamData: CreateTeamData) => {
    try {
      console.log('Submitting team data:', teamData)
      
      if (editingTeam) {
        const response = await fetch(`/api/teams/${editingTeam.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teamData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update team')
        }
        
        setMessage("Time atualizado com sucesso!")
      } else {
        const response = await fetch('/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teamData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Team creation error:', errorData)
          throw new Error(errorData.error || 'Failed to create team')
        }
        
        const createdTeam = await response.json()
        console.log('Team created successfully:', createdTeam)
        setMessage("Time adicionado com sucesso!")
      }
      
      await loadTeams()
      setShowTeamForm(false)
      setEditingTeam(null)
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error('Error saving team:', error)
      setMessage(`Erro ao salvar time: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setTimeout(() => setMessage(""), 5000)
    }
  }

  const handlePlayerSubmit = async (playerData: {
    name: string
    position: string
    number?: number
  }) => {
    try {
      if (!selectedTeam) return
      
      console.log('Submitting player data:', playerData)
      
      if (editingPlayer) {
        // Update existing player
        const response = await fetch(`/api/players/${editingPlayer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playerData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update player')
        }
        
        setMessage("Jogador atualizado com sucesso!")
      } else {
        // Create new player
        const response = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...playerData,
            teamId: selectedTeam.id
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Player creation error:', errorData)
          throw new Error(errorData.error || 'Failed to create player')
        }
        
        const createdPlayer = await response.json()
        console.log('Player created successfully:', createdPlayer)
        setMessage("Jogador adicionado com sucesso!")
      }
      
      // Reload teams to get updated player list
      await loadTeams()
      const updatedTeam = teams.find(t => t.id === selectedTeam.id)
      if (updatedTeam) {
        setSelectedTeam(updatedTeam)
      }
      
      setShowPlayerForm(false)
      setEditingPlayer(null)
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error('Error saving player:', error)
      setMessage(`Erro ao salvar jogador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setTimeout(() => setMessage(""), 5000)
    }
  }

  const handleDeleteTeam = async (team: TeamWithPlayers) => {
    if (confirm(`Tem certeza que deseja excluir o time "${team.name}"? Todos os jogadores também serão removidos.`)) {
      try {
        const response = await fetch(`/api/teams/${team.id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete team')
        }
        
        await loadTeams()
        if (selectedTeam?.id === team.id) {
          setSelectedTeam(null)
        }
        setMessage("Time excluído com sucesso!")
        setTimeout(() => setMessage(""), 3000)
      } catch (error) {
        console.error('Error deleting team:', error)
        setMessage(`Erro ao excluir time: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        setTimeout(() => setMessage(""), 3000)
      }
    }
  }

  const handleDeletePlayer = async (player: any) => {
    if (confirm(`Tem certeza que deseja excluir o jogador "${player.name}"?`)) {
      try {
        const response = await fetch(`/api/players/${player.id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete player')
        }
        
        // Reload teams to get updated player list
        await loadTeams()
        const updatedTeam = teams.find(t => t.id === selectedTeam?.id)
        if (updatedTeam && selectedTeam) {
          setSelectedTeam(updatedTeam)
        }
        
        setMessage("Jogador excluído com sucesso!")
        setTimeout(() => setMessage(""), 3000)
      } catch (error) {
        console.error('Error deleting player:', error)
        setMessage(`Erro ao excluir jogador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        setTimeout(() => setMessage(""), 3000)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fcc] mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuth) {
    return <AdminLogin onLogin={handleLogin} />
  }

  if (showTeamForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader onLogout={handleLogout} />
        <main className="p-4">
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowTeamForm(false)
                setEditingTeam(null)
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </div>
          <TeamForm
            team={editingTeam || undefined}
            onSubmit={handleTeamSubmit}
            onCancel={() => {
              setShowTeamForm(false)
              setEditingTeam(null)
            }}
          />
        </main>
      </div>
    )
  }

  if (showPlayerForm && selectedTeam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader onLogout={handleLogout} />
        <main className="p-4">
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowPlayerForm(false)
                setEditingPlayer(null)
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para {selectedTeam.name}
            </Button>
          </div>
          <PlayerForm
            player={editingPlayer || undefined}
            teamId={selectedTeam.id}
            onSubmit={handlePlayerSubmit}
            onCancel={() => {
              setShowPlayerForm(false)
              setEditingPlayer(null)
            }}
          />
        </main>
      </div>
    )
  }

  if (selectedTeam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader onLogout={handleLogout} />
        <main className="p-4">
          <div className="mb-4">
            <Button variant="ghost" onClick={() => setSelectedTeam(null)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para Times
            </Button>
          </div>

          {message && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src={selectedTeam.logo || "/placeholder.svg"}
                    alt={selectedTeam.name}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                  <CardTitle>{selectedTeam.name}</CardTitle>
                </div>
                <Button
                  onClick={() => {
                    setEditingTeam(selectedTeam)
                    setShowTeamForm(true)
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar Time
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Jogadores ({selectedTeam.players?.length || 0})
                </CardTitle>
                <Button onClick={() => setShowPlayerForm(true)} className="bg-[#007fcc] hover:bg-[#006bb3]" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Jogador
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedTeam.players || selectedTeam.players.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum jogador cadastrado neste time</p>
              ) : (
                <div className="space-y-2">
                  {selectedTeam.players.map((player: any) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {player.position}
                            </Badge>
                            {player.number && <span>#{player.number}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => {
                            setEditingPlayer(player)
                            setShowPlayerForm(true)
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeletePlayer(player)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onLogout={handleLogout} />

      <main className="p-4">
        <div className="mb-4">
          <Link href="/administrador">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar ao Painel
            </Button>
          </Link>
        </div>

        {message && (
          <Alert className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciar Times ({teams.length})
              </CardTitle>
              <Button onClick={() => setShowTeamForm(true)} className="bg-[#007fcc] hover:bg-[#006bb3]">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Time
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum time cadastrado</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <div key={team.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={team.logo || "/placeholder.svg"}
                          alt={team.name}
                          width={32}
                          height={32}
                          className="rounded"
                        />
                        <div>
                          <h3 className="font-medium">{team.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {team.players?.length || 0} jogadores
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => {
                            setEditingTeam(team)
                            setShowTeamForm(true)
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteTeam(team)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button onClick={() => setSelectedTeam(team)} variant="outline" className="w-full">
                      Gerenciar Jogadores
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
