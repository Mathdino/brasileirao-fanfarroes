"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayerGoalStats, PlayerAssistStats, GoalkeeperStats, PlayerCardStats } from "@/lib/types"
import { Target, Users, Shield, CreditCard, Square, SquareX, Trophy, RefreshCw } from "lucide-react"
import Image from "next/image"

export default function RankingsClient() {
  const [topScorers, setTopScorers] = useState<PlayerGoalStats[]>([])
  const [topAssists, setTopAssists] = useState<PlayerAssistStats[]>([])
  const [bestGoalkeepers, setBestGoalkeepers] = useState<GoalkeeperStats[]>([])
  const [cardStats, setCardStats] = useState<PlayerCardStats[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRankings = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      // Fetch all rankings in parallel
      const [scorersRes, assistsRes, goalkeepersRes, cardsRes] = await Promise.all([
        fetch('/api/statistics/players?type=scorers&limit=10'),
        fetch('/api/statistics/players?type=assists&limit=10'),
        fetch('/api/statistics/players?type=goalkeepers&limit=10'),
        fetch('/api/statistics/players?type=cards&limit=10')
      ])

      if (!scorersRes.ok || !assistsRes.ok || !goalkeepersRes.ok || !cardsRes.ok) {
        throw new Error('Failed to fetch rankings')
      }

      const scorers = await scorersRes.json()
      const assists = await assistsRes.json()
      const goalkeepers = await goalkeepersRes.json()
      const cards = await cardsRes.json()
      
      setTopScorers(scorers)
      setTopAssists(assists)
      setBestGoalkeepers(goalkeepers)
      setCardStats(cards)
      
    } catch (err) {
      console.error('Error fetching rankings:', err)
      setError('Failed to load rankings. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRankings()
    
    // Set up polling to refresh data every 30 seconds
    const interval = setInterval(() => fetchRankings(true), 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getPositionBadge = (position: number) => {
    if (position === 1) {
      return <Badge className="bg-yellow-500 text-white">🥇 1º</Badge>
    }
    if (position === 2) {
      return <Badge className="bg-gray-400 text-white">🥈 2º</Badge>
    }
    if (position === 3) {
      return <Badge className="bg-amber-600 text-white">🥉 3º</Badge>
    }
    return <Badge variant="outline">{position}º</Badge>
  }

  if (loading) {
    return <div className="text-center py-8">Carregando rankings...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  const totalGoals = topScorers.reduce((sum, stat) => sum + stat.goals, 0)
  const totalAssists = topAssists.reduce((sum, stat) => sum + stat.assists, 0)
  const totalCards = cardStats.reduce((sum, stat) => sum + stat.totalCards, 0)
  const totalYellowCards = cardStats.reduce((sum, stat) => sum + stat.yellowCards, 0)
  const totalRedCards = cardStats.reduce((sum, stat) => sum + stat.redCards, 0)

  return (
    <>
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => fetchRankings(true)} 
          disabled={refreshing}
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Top Scorers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#007fcc]" />
            Artilheiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topScorers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum gol marcado ainda</p>
          ) : (
            <div className={`space-y-3 ${topScorers.length > 5 ? 'max-h-[400px] overflow-y-auto pr-2 scrollbar-hide' : ''}`}>
              {topScorers.map((stat, index) => (
                <div key={stat.player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPositionBadge(index + 1)}
                    {stat.team.logo && (
                      <Image
                        src={stat.team.logo}
                        alt={stat.team.name}
                        width={32}
                        height={32}
                        className="rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium">{stat.player.name}</p>
                      <p className="text-sm text-muted-foreground">{stat.team.name}</p>
                      <p className="text-xs text-muted-foreground">{stat.player.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#007fcc]">{stat.goals}</p>
                    <p className="text-xs text-muted-foreground">gols</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Assists */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#007fcc]" />
            Assistências
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topAssists.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma assistência registrada ainda</p>
          ) : (
            <div className={`space-y-3 ${topAssists.length > 5 ? 'max-h-[400px] overflow-y-auto pr-2 scrollbar-hide' : ''}`}>
              {topAssists.map((stat, index) => (
                <div key={stat.player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPositionBadge(index + 1)}
                    {stat.team.logo && (
                      <Image
                        src={stat.team.logo}
                        alt={stat.team.name}
                        width={32}
                        height={32}
                        className="rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium">{stat.player.name}</p>
                      <p className="text-sm text-muted-foreground">{stat.team.name}</p>
                      <p className="text-xs text-muted-foreground">{stat.player.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#007fcc]">{stat.assists}</p>
                    <p className="text-xs text-muted-foreground">assistências</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Best Goalkeepers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#007fcc]" />
            Melhor Goleiro
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Goleiro que sofreu menos gols no campeonato
          </p>
        </CardHeader>
        <CardContent>
          {bestGoalkeepers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum goleiro registrado ainda</p>
          ) : (
            <div className={`space-y-3 ${bestGoalkeepers.length > 5 ? 'max-h-[400px] overflow-y-auto pr-2 scrollbar-hide' : ''}`}>
              {bestGoalkeepers.map((stat, index) => (
                <div key={stat.player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPositionBadge(index + 1)}
                    {stat.team.logo && (
                      <Image
                        src={stat.team.logo}
                        alt={stat.team.name}
                        width={32}
                        height={32}
                        className="rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium">{stat.player.name}</p>
                      <p className="text-sm text-muted-foreground">{stat.team.name}</p>
                      <p className="text-xs text-muted-foreground">{stat.player.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-col items-end">
                      <p className="text-lg font-bold text-[#007fcc]">{stat.goalsAgainst}</p>
                      <p className="text-xs text-muted-foreground">gols sofridos</p>
                      <p className="text-xs text-muted-foreground">{stat.matchesPlayed} jogos</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#007fcc]" />
            Cartões
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Jogadores com mais cartões no campeonato
          </p>
        </CardHeader>
        <CardContent>
          {cardStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum cartão aplicado ainda</p>
          ) : (
            <div className={`space-y-3 ${cardStats.length > 5 ? 'max-h-[400px] overflow-y-auto pr-2 scrollbar-hide' : ''}`}>
              {cardStats.map((stat, index) => (
                <div key={stat.player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPositionBadge(index + 1)}
                    {stat.team.logo && (
                      <Image
                        src={stat.team.logo}
                        alt={stat.team.name}
                        width={32}
                        height={32}
                        className="rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium">{stat.player.name}</p>
                      <p className="text-sm text-muted-foreground">{stat.team.name}</p>
                      <p className="text-xs text-muted-foreground">{stat.player.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-2xl font-bold text-[#007fcc]">{stat.totalCards}</p>
                      <p className="text-xs text-muted-foreground">cartões</p>
                      <div className="flex items-center gap-2">
                        {stat.yellowCards > 0 && (
                          <div className="flex items-center gap-1">
                            <Square className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs">{stat.yellowCards}</span>
                          </div>
                        )}
                        {stat.redCards > 0 && (
                          <div className="flex items-center gap-1">
                            <SquareX className="w-3 h-3 text-red-500 fill-red-500" />
                            <span className="text-xs">{stat.redCards}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Combined Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#007fcc]" />
            Estatísticas Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#007fcc]">{totalGoals}</p>
              <p className="text-xs text-muted-foreground">Total de Gols</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#007fcc]">{totalAssists}</p>
              <p className="text-xs text-muted-foreground">Total de Assistências</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mt-4 pt-4 border-t">
            <div>
              <div className="flex items-center justify-center gap-2">
                <Square className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <p className="text-xl font-bold text-yellow-600">{totalYellowCards}</p>
              </div>
              <p className="text-xs text-muted-foreground">Cartões Amarelos</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <SquareX className="w-4 h-4 text-red-500 fill-red-500" />
                <p className="text-xl font-bold text-red-600">{totalRedCards}</p>
              </div>
              <p className="text-xs text-muted-foreground">Cartões Vermelhos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}