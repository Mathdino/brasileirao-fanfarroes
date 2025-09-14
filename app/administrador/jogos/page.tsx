"use client"
import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin-login"
import { AdminHeader } from "@/components/admin-header"
import { MatchForm } from "@/components/match-form"
import { GoalForm } from "@/components/goal-form"
import { CardForm } from "@/components/card-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { isAuthenticated } from "@/lib/auth"
import type { MatchWithTeams, TeamWithPlayers } from "@/lib/types"
import { Plus, Edit, Trash2, Target, ArrowLeft, Calendar, Clock, CreditCard, Square, SquareX } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function MatchesManagementPage() {
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [matches, setMatches] = useState<MatchWithTeams[]>([])
  const [teams, setTeams] = useState<TeamWithPlayers[]>([])
  const [allPlayers, setAllPlayers] = useState<any[]>([])
  const [matchGoals, setMatchGoals] = useState<any[]>([])
  const [matchCards, setMatchCards] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState<MatchWithTeams | null>(null)
  const [showMatchForm, setShowMatchForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)
  const [editingMatch, setEditingMatch] = useState<MatchWithTeams | null>(null)
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const [editingCard, setEditingCard] = useState<any>(null)
  const [message, setMessage] = useState("")

  const loadMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      if (response.ok) {
        const matchesData = await response.json()
        setMatches(matchesData)
      } else {
        console.error('Failed to fetch matches:', response.statusText)
        setMatches([])
      }
    } catch (error) {
      console.error('Error loading matches:', error)
      setMatches([])
    }
  }

  const loadTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const teamsData = await response.json()
        setTeams(teamsData)
        
        // Extract all players from teams
        const players: any[] = []
        teamsData.forEach((team: TeamWithPlayers) => {
          if (team.players) {
            players.push(...team.players)
          }
        })
        setAllPlayers(players)
      } else {
        console.error('Failed to fetch teams:', response.statusText)
        setTeams([])
        setAllPlayers([])
      }
    } catch (error) {
      console.error('Error loading teams:', error)
      setTeams([])
      setAllPlayers([])
    }
  }

  useEffect(() => {
    setIsAuth(isAuthenticated())
    setIsLoading(false)
    if (isAuthenticated()) {
      loadMatches()
      loadTeams()
    }
  }, [])

  useEffect(() => {
    // Auto-refresh data when selectedMatch changes
    if (selectedMatch) {
      setMatchGoals(selectedMatch.goals || [])
      setMatchCards(selectedMatch.cards || [])
    }
  }, [selectedMatch])

  const handleLogin = () => {
    setIsAuth(true)
    loadMatches()
    loadTeams()
  }

  const handleLogout = () => {
    setIsAuth(false)
    setSelectedMatch(null)
    setShowMatchForm(false)
    setShowGoalForm(false)
  }

  const handleMatchSubmit = async (matchData: {
    homeTeamId: string
    awayTeamId: string
    homeScore: number
    awayScore: number
    matchDate: Date
    status: string
  }) => {
    try {
      if (editingMatch) {
        // Para atualização, usar a API de atualização de resultados
        const updateData = {
          homeScore: matchData.homeScore,
          awayScore: matchData.awayScore,
          finished: matchData.status === "completed",
          matchDate: matchData.matchDate,
          goals: [] // Goals são gerenciados separadamente
        }
        
        const response = await fetch(`/api/matches/${editingMatch.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update match')
        }
        
        setMessage("Jogo atualizado com sucesso!")
      } else {
        // Para criação, usar apenas os dados básicos
        const response = await fetch('/api/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            homeTeamId: matchData.homeTeamId,
            awayTeamId: matchData.awayTeamId,
            matchDate: matchData.matchDate
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create match')
        }
        
        setMessage("Jogo agendado com sucesso!")
      }
      
      // Recarregar dados após atualização
      await loadMatches()
      setShowMatchForm(false)
      setEditingMatch(null)
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error('Error saving match:', error)
      setMessage(`Erro ao salvar jogo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setTimeout(() => setMessage(""), 5000)
    }
  }

  const handleGoalSubmit = async (goalData: {
    playerId: string
    assistPlayerId?: string
    minute: number
    teamId: string
  }) => {
    try {
      if (!selectedMatch) return
      
      if (editingGoal) {
        const response = await fetch(`/api/goals/${editingGoal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goalData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update goal')
        }
        
        setMessage("Gol atualizado com sucesso!")
      } else {
        const response = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...goalData, matchId: selectedMatch.id })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create goal')
        }
        
        setMessage("Gol registrado com sucesso!")
      }
      
      // Reload matches to get updated scores and goals
      await loadMatches()
      
      // Find and update selected match with fresh data  
      const matchesResponse = await fetch('/api/matches')
      if (matchesResponse.ok) {
        const updatedMatches = await matchesResponse.json()
        setMatches(updatedMatches)
        
        const updatedMatch = updatedMatches.find((m: any) => m.id === selectedMatch.id)
        if (updatedMatch) {
          setSelectedMatch(updatedMatch)
          setMatchGoals(updatedMatch.goals || [])
        }
      }
      
      setShowGoalForm(false)
      setEditingGoal(null)
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error('Error saving goal:', error)
      setMessage(`Erro ao salvar gol: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setTimeout(() => setMessage(""), 5000)
    }
  }

  const handleDeleteMatch = async (match: any) => {
    if (confirm(`Tem certeza que deseja excluir este jogo?\n\n⚠️ ATENÇÃO: Esta ação irá remover PERMANENTEMENTE:\n• O jogo e seu resultado\n• Todos os gols e assistências\n• Todos os cartões aplicados\n• Os pontos serão recalculados na classificação\n• Todas as estatísticas dos rankings serão atualizadas\n\nEsta ação não pode ser desfeita!`)) {
      try {
        const response = await fetch(`/api/matches/${match.id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete match')
        }
        
        await loadMatches()
        if (selectedMatch?.id === match.id) {
          setSelectedMatch(null)
        }
        setMessage("Jogo excluído com sucesso! Todos os gols, cartões e pontos foram removidos. A classificação e rankings foram atualizados.")
        setTimeout(() => setMessage(""), 5000)
      } catch (error) {
        console.error('Error deleting match:', error)
        setMessage(`Erro ao excluir jogo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        setTimeout(() => setMessage(""), 3000)
      }
    }
  }

  const handleDeleteGoal = async (goal: any) => {
    if (confirm("Tem certeza que deseja excluir este gol?")) {
      try {
        const deleteResponse = await fetch(`/api/goals/${goal.id}`, {
          method: 'DELETE'
        })
        
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json()
          throw new Error(errorData.error || 'Failed to delete goal')
        }
        
        // Reload matches to get updated scores
        await loadMatches()
        
        // Find and update selected match with fresh data
        const matchesResponse = await fetch('/api/matches')
        if (matchesResponse.ok && selectedMatch) {
          const updatedMatches = await matchesResponse.json()
          setMatches(updatedMatches)
          
          const updatedMatch = updatedMatches.find((m: any) => m.id === selectedMatch.id)
          if (updatedMatch) {
            setSelectedMatch(updatedMatch)
            setMatchGoals(updatedMatch.goals || [])
          }
        }
        
        setMessage("Gol excluído com sucesso!")
        setTimeout(() => setMessage(""), 3000)
      } catch (error) {
        console.error('Error deleting goal:', error)
        setMessage(`Erro ao excluir gol: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        setTimeout(() => setMessage(""), 3000)
      }
    }
  }

  const handleCardSubmit = async (cardData: {
    playerId: string
    teamId: string
    type: string
    minute?: number
  }) => {
    try {
      if (!selectedMatch) return
      
      if (editingCard) {
        const response = await fetch(`/api/cards/${editingCard.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update card')
        }
        
        setMessage("Cartão atualizado com sucesso!")
      } else {
        const response = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...cardData, matchId: selectedMatch.id })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create card')
        }
        
        setMessage("Cartão registrado com sucesso!")
      }
      
      // Recarregar dados após atualização
      await loadMatches()
      setShowCardForm(false)
      setEditingCard(null)
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error('Error saving card:', error)
      setMessage(`Erro ao salvar cartão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setTimeout(() => setMessage(""), 5000)
    }
  }

  const handleDeleteCard = async (card: any) => {
    if (confirm("Tem certeza que deseja excluir este cartão?")) {
      try {
        const deleteResponse = await fetch(`/api/cards/${card.id}`, {
          method: 'DELETE'
        })
        
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json()
          throw new Error(errorData.error || 'Failed to delete card')
        }
        
        // Reload matches to get updated data
        await loadMatches()
        
        // Find and update selected match with fresh data
        const matchesResponse = await fetch('/api/matches')
        if (matchesResponse.ok && selectedMatch) {
          const updatedMatches = await matchesResponse.json()
          setMatches(updatedMatches)
          
          const updatedMatch = updatedMatches.find((m: any) => m.id === selectedMatch.id)
          if (updatedMatch) {
            setSelectedMatch(updatedMatch)
            setMatchCards(updatedMatch.cards || [])
          }
        }
        
        setMessage("Cartão excluído com sucesso!")
        setTimeout(() => setMessage(""), 3000)
      } catch (error) {
        console.error('Error deleting card:', error)
        setMessage(`Erro ao excluir cartão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        setTimeout(() => setMessage(""), 3000)
      }
    }
  }

  const getTeamName = (teamId: string) => {
    return teams.find((team) => team.id === teamId)?.name || "Time não encontrado"
  }

  const getPlayerName = (playerId: string) => {
    return allPlayers.find((player) => player.id === playerId)?.name || "Jogador não encontrado"
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (match: any) => {
    let status = "scheduled"
    if (match.finished) {
      status = "completed"
    } else if (new Date(match.matchDate) < new Date()) {
      status = "live"
    }

    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Agendado
          </Badge>
        )
      case "live":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ao Vivo
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Finalizado
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Agendado
          </Badge>
        )
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

  if (showMatchForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader onLogout={handleLogout} />
        <main className="p-2 sm:p-4">
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowMatchForm(false)
                setEditingMatch(null)
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </div>
          <MatchForm
            match={editingMatch || undefined}
            teams={teams}
            onSubmit={handleMatchSubmit}
            onCancel={() => {
              setShowMatchForm(false)
              setEditingMatch(null)
            }}
          />
        </main>
      </div>
    )
  }

  if (showGoalForm && selectedMatch) {
    const homeTeamPlayers = teams.find(t => t.id === selectedMatch.homeTeamId)?.players || []
    const awayTeamPlayers = teams.find(t => t.id === selectedMatch.awayTeamId)?.players || []
    const matchPlayers = [...homeTeamPlayers, ...awayTeamPlayers]

    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader onLogout={handleLogout} />
        <main className="p-2 sm:p-4">
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowGoalForm(false)
                setEditingGoal(null)
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para o Jogo
            </Button>
          </div>
          <GoalForm
            goal={editingGoal || undefined}
            matchId={selectedMatch.id}
            players={matchPlayers}
            onSubmit={handleGoalSubmit}
            onCancel={() => {
              setShowGoalForm(false)
              setEditingGoal(null)
            }}
          />
        </main>
      </div>
    )
  }

  if (showCardForm && selectedMatch) {
    const homeTeam = teams.find(t => t.id === selectedMatch.homeTeamId)
    const awayTeam = teams.find(t => t.id === selectedMatch.awayTeamId)
    const matchTeams = [homeTeam, awayTeam].filter(Boolean) as TeamWithPlayers[]

    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader onLogout={handleLogout} />
        <main className="p-2 sm:p-4">
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCardForm(false)
                setEditingCard(null)
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para o Jogo
            </Button>
          </div>
          <CardForm
            isOpen={showCardForm}
            onClose={() => {
              setShowCardForm(false)
              setEditingCard(null)
            }}
            matchId={selectedMatch.id}
            teams={matchTeams}
            onSubmit={handleCardSubmit}
            editingCard={editingCard}
          />
        </main>
      </div>
    )
  }

  if (selectedMatch) {
    const homeTeam = teams.find((t) => t.id === selectedMatch.homeTeamId)!
    const awayTeam = teams.find((t) => t.id === selectedMatch.awayTeamId)!

    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader onLogout={handleLogout} />
        <main className="p-2 sm:p-4">
          <div className="mb-4">
            <Button variant="ghost" onClick={() => setSelectedMatch(null)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para Jogos
            </Button>
          </div>

          {message && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-4">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Image
                          src={homeTeam.logo || "/placeholder.svg"}
                          alt={homeTeam.name}
                          width={32}
                          height={32}
                          className="rounded flex-shrink-0"
                        />
                        <span className="text-sm sm:text-base truncate">{homeTeam.name}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-xl sm:text-2xl font-bold">{selectedMatch.homeScore}</span>
                        <span className="text-muted-foreground text-sm sm:text-base">x</span>
                        <span className="text-xl sm:text-2xl font-bold">{selectedMatch.awayScore}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base truncate">{awayTeam.name}</span>
                        <Image
                          src={awayTeam.logo || "/placeholder.svg"}
                          alt={awayTeam.name}
                          width={32}
                          height={32}
                          className="rounded flex-shrink-0"
                        />
                      </div>
                    </div>
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{formatDate(selectedMatch.matchDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusBadge(selectedMatch)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mt-2 sm:mt-0">
                  <Button
                    onClick={() => {
                      setEditingMatch(selectedMatch)
                      setShowMatchForm(true)
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar Jogo
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 flex-shrink-0" />
                  Gols ({matchGoals.length})
                </CardTitle>
                <Button onClick={() => setShowGoalForm(true)} className="bg-[#007fcc] hover:bg-[#006bb3] w-full sm:w-auto" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Registrar Gol
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {matchGoals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum gol registrado neste jogo</p>
              ) : (
                <div className="space-y-2">
                  {matchGoals
                    .sort((a, b) => a.minute - b.minute)
                    .map((goal) => {
                      const scorer = allPlayers.find((p) => p.id === goal.playerId)
                      const assister = goal.assistPlayerId ? allPlayers.find((p) => p.id === goal.assistPlayerId) : null
                      const team = teams.find((t) => t.id === goal.teamId)

                      return (
                        <div key={goal.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Image
                                src={team?.logo || ""}
                                alt={team?.name || ""}
                                width={24}
                                height={24}
                                className="rounded flex-shrink-0"
                              />
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {goal.minute}'
                              </Badge>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{scorer?.name}</p>
                              {assister && (
                                <p className="text-sm text-muted-foreground truncate">Assistência: {assister.name}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 self-end sm:self-center">
                            <Button
                              onClick={() => {
                                setEditingGoal(goal)
                                setShowGoalForm(true)
                              }}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteGoal(goal)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards Section */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 flex-shrink-0" />
                  Cartões ({matchCards.length})
                </CardTitle>
                <Button onClick={() => setShowCardForm(true)} className="bg-[#007fcc] hover:bg-[#006bb3] w-full sm:w-auto" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Aplicar Cartão
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {matchCards.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum cartão aplicado neste jogo</p>
              ) : (
                <div className="space-y-2">
                  {matchCards
                    .sort((a, b) => (a.minute || 0) - (b.minute || 0))
                    .map((card) => {
                      const player = allPlayers.find((p) => p.id === card.playerId)
                      const team = teams.find((t) => t.id === card.teamId)

                      return (
                        <div key={card.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Image
                                src={team?.logo || ""}
                                alt={team?.name || ""}
                                width={24}
                                height={24}
                                className="rounded flex-shrink-0"
                              />
                              {card.minute && (
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {card.minute}'
                                </Badge>
                              )}
                              {card.type === "YELLOW" ? (
                                <Square className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                              ) : (
                                <SquareX className="w-4 h-4 text-red-500 fill-red-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{player?.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                Cartão {card.type === "YELLOW" ? "Amarelo" : "Vermelho"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 self-end sm:self-center">
                            <Button
                              onClick={() => {
                                setEditingCard(card)
                                setShowCardForm(true)
                              }}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteCard(card)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
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

      <main className="p-2 sm:p-4">
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 flex-shrink-0" />
                Gerenciar Jogos ({matches.length})
              </CardTitle>
              <Button onClick={() => setShowMatchForm(true)} className="bg-[#007fcc] hover:bg-[#006bb3] w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1" />
                Agendar Jogo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum jogo agendado</p>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => {
                  const homeTeam = teams.find((t) => t.id === match.homeTeamId) || { 
                    id: 'not-found', 
                    name: 'Time não encontrado', 
                    logo: '/placeholder.svg',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                  const awayTeam = teams.find((t) => t.id === match.awayTeamId) || { 
                    id: 'not-found', 
                    name: 'Time não encontrado', 
                    logo: '/placeholder.svg',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                  const goals = match.goals || []

                  return (
                    <div key={match.id} className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col gap-3">
                        {/* Match Header */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                            <div className="flex items-center gap-2">
                              <Image
                                src={homeTeam.logo || "/placeholder.svg"}
                                alt={homeTeam.name}
                                width={24}
                                height={24}
                                className="rounded flex-shrink-0"
                              />
                              <span className="font-medium text-sm sm:text-base truncate">{homeTeam.name}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-lg sm:text-xl font-bold">{match.homeScore}</span>
                              <span className="text-muted-foreground text-sm">x</span>
                              <span className="text-lg sm:text-xl font-bold">{match.awayScore}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm sm:text-base truncate">{awayTeam.name}</span>
                              <Image
                                src={awayTeam.logo || "/placeholder.svg"}
                                alt={awayTeam.name}
                                width={24}
                                height={24}
                                className="rounded flex-shrink-0"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-center">
                            {getStatusBadge(match)}
                            <Button
                              onClick={() => {
                                setEditingMatch(match)
                                setShowMatchForm(true)
                              }}
                              variant="ghost"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteMatch(match)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Match Details */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-muted-foreground">
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span className="text-xs sm:text-sm">{formatDate(match.matchDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4 flex-shrink-0" />
                              <span className="text-xs sm:text-sm">{goals.length} gols</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-4 w-4 flex-shrink-0" />
                              <span className="text-xs sm:text-sm">{(match.cards || []).length} cartões</span>
                            </div>
                          </div>
                          <Button onClick={() => setSelectedMatch(match)} variant="outline" size="sm" className="w-full sm:w-auto">
                            Gerenciar Jogo
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
