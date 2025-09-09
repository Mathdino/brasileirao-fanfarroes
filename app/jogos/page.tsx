"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin } from "lucide-react"
import Image from "next/image"
import type { MatchWithTeams } from "@/lib/types"

export default function MatchesPage() {
  const [allMatches, setAllMatches] = useState<MatchWithTeams[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<MatchWithTeams[]>([])
  const [completedMatches, setCompletedMatches] = useState<MatchWithTeams[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const loadMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      if (response.ok) {
        const matches: MatchWithTeams[] = await response.json()
        setAllMatches(matches)
        
        // Filter matches client-side
        const now = new Date()
        const upcoming = matches.filter(match => 
          !match.finished && new Date(match.matchDate) >= now
        )
        const completed = matches.filter(match => match.finished)
        
        setUpcomingMatches(upcoming)
        setCompletedMatches(completed)
      } else {
        console.error('Failed to fetch matches:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    loadMatches()
  }, [])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (finished: boolean, date: Date) => {
    if (finished) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Finalizado
        </Badge>
      )
    }
    
    const now = new Date()
    const matchDate = new Date(date)
    
    if (matchDate > now) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Agendado
        </Badge>
      )
    }
    
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        Pendente
      </Badge>
    )
  }

  const liveMatches = allMatches.filter(match => 
    !match.finished && new Date(match.matchDate) <= new Date()
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007fcc] mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando jogos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#007fcc] text-white p-4">
        <h1 className="text-xl font-bold text-center">Brasileirão Fanfarrões</h1>
        <p className="text-center text-sm opacity-90">Jogos</p>
      </header>

      <main className="p-4 space-y-6">
        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {liveMatches.map((match) => (
                <div key={match.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {match.homeTeam.logo && (
                          <Image
                            src={match.homeTeam.logo}
                            alt={match.homeTeam.name}
                            width={32}
                            height={32}
                            className="rounded"
                          />
                        )}
                        <span className="font-medium">{match.homeTeam.name}</span>
                        <span className="text-2xl font-bold text-green-700">{match.homeScore}</span>
                        <span className="text-muted-foreground">x</span>
                        <span className="text-2xl font-bold text-green-700">{match.awayScore}</span>
                        <span className="font-medium">{match.awayTeam.name}</span>
                        {match.awayTeam.logo && (
                          <Image
                            src={match.awayTeam.logo}
                            alt={match.awayTeam.name}
                            width={32}
                            height={32}
                            className="rounded"
                          />
                        )}
                      </div>
                    </div>
                    {getStatusBadge(match.finished, match.matchDate)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(match.matchDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(match.matchDate)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#007fcc]" />
              Próximos Jogos ({upcomingMatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMatches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum jogo agendado</p>
            ) : (
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          {match.homeTeam.logo && (
                            <Image
                              src={match.homeTeam.logo}
                              alt={match.homeTeam.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          )}
                          <span className="font-medium">{match.homeTeam.name}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span className="font-medium">{match.awayTeam.name}</span>
                          {match.awayTeam.logo && (
                            <Image
                              src={match.awayTeam.logo}
                              alt={match.awayTeam.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          )}
                        </div>
                      </div>
                      {getStatusBadge(match.finished, match.matchDate)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(match.matchDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(match.matchDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#007fcc]" />
              Jogos Finalizados ({completedMatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedMatches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum jogo finalizado ainda</p>
            ) : (
              <div className="space-y-3">
                {completedMatches.map((match) => (
                  <div key={match.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          {match.homeTeam.logo && (
                            <Image
                              src={match.homeTeam.logo}
                              alt={match.homeTeam.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          )}
                          <span className="font-medium">{match.homeTeam.name}</span>
                          <span className="text-2xl font-bold">{match.homeScore}</span>
                          <span className="text-muted-foreground">x</span>
                          <span className="text-2xl font-bold">{match.awayScore}</span>
                          <span className="font-medium">{match.awayTeam.name}</span>
                          {match.awayTeam.logo && (
                            <Image
                              src={match.awayTeam.logo}
                              alt={match.awayTeam.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          )}
                        </div>
                      </div>
                      {getStatusBadge(match.finished, match.matchDate)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(match.matchDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(match.matchDate)}
                      </div>
                      <span>{match.goals.length} gols</span>
                    </div>
                    
                    {/* Goals */}
                    {match.goals.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <h4 className="text-sm font-medium mb-2">Gols:</h4>
                        <div className="space-y-1">
                          {match.goals.map((goal) => (
                            <div key={goal.id} className="text-sm text-gray-600">
                              <span className="font-medium">{goal.scorer.name}</span>
                              {goal.assistant && (
                                <span> (assist: {goal.assistant.name})</span>
                              )}
                              {goal.minute && <span className="text-gray-400"> - {goal.minute}'</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
