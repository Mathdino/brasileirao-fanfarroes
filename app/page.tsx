import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTeamStats } from "@/lib/team-management"
import { TeamStats } from "@/lib/types"
import Image from "next/image"
import { Medal, Check, X, Minus } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let teamStats: TeamStats[] = []
  
  try {
    teamStats = await getTeamStats()
  } catch (error) {
    console.error('Error fetching team stats:', error)
    // Se o banco não estiver configurado ainda, mostra uma mensagem
  }

  if (teamStats.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-[#007fcc] text-white p-4">
          <h1 className="text-xl font-bold text-center">Brasileirão Fanfarrões</h1>
          <p className="text-center text-sm opacity-90">Classificação</p>
        </header>

        <main className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tabela de Classificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>Nenhum time cadastrado ainda.</p>
                <p className="text-sm mt-2">Configure o banco de dados e cadastre os times.</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#007fcc] text-white p-4">
        <h1 className="text-xl font-bold text-center">Brasileirão Fanfarrões</h1>
        <p className="text-center text-sm opacity-90">Classificação</p>
      </header>

      <main className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tabela de Classificação</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2 font-medium"><Medal className="w-3 h-3"/></th>
                    <th className="text-left p-2 font-medium">Times</th>
                    <th className="text-center p-2 font-medium">P</th>
                    <th className="text-center p-2 font-medium">J</th>
                    <th className="text-center p-2 font-medium">V</th>
                    <th className="text-center p-2 font-medium">E</th>
                    <th className="text-center p-2 font-medium">D</th>
                    <th className="text-center p-2 font-medium">GP</th>
                    <th className="text-center p-2 font-medium">GC</th>
                    <th className="text-center p-2 font-medium">SG</th>
                    <th className="text-center p-2 font-medium">Últimos 5</th>
                  </tr>
                </thead>
                <tbody>
                  {teamStats.map((stats: TeamStats) => (
                    <tr key={stats.team.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{stats.position}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {stats.team.logo && (
                            <Image
                              src={stats.team.logo}
                              alt={stats.team.name}
                              width={24}
                              height={24}
                              className="rounded"
                            />
                          )}
                          <span className="font-medium text-sm">{stats.team.name}</span>
                        </div>
                      </td>
                      <td className="text-center p-2 font-bold text-[#007fcc]">{stats.points}</td>
                      <td className="text-center p-2">{stats.games}</td>
                      <td className="text-center p-2">{stats.wins}</td>
                      <td className="text-center p-2">{stats.draws}</td>
                      <td className="text-center p-2">{stats.defeats}</td>
                      <td className="text-center p-2">{stats.goalsFor}</td>
                      <td className="text-center p-2">{stats.goalsAgainst}</td>
                      <td className="text-center p-2 font-medium">
                        <span className={cn(
                          stats.goalDifference > 0 && "text-green-600",
                          stats.goalDifference < 0 && "text-red-600"
                        )}>
                          {stats.goalDifference > 0 ? "+" : ""}
                          {stats.goalDifference}
                        </span>
                      </td>
                      <td className="text-center p-2">
                        <div className="flex gap-1 justify-center">
                          {stats.lastFiveGames.map((result: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={cn(
                                "w-5 h-5 p-0 text-xs flex items-center justify-center",
                                result === "W" && "bg-green-100 text-green-800 border-green-300",
                                result === "D" && "bg-yellow-100 text-yellow-800 border-yellow-300",
                                result === "L" && "bg-red-100 text-red-800 border-red-300",
                              )}
                            >
                              {result === "W" && <Check className="w-4 h-4" />}
                              {result === "L" && <X className="w-4 h-4" />}
                              {result === "D" && <Minus className="w-4 h-4" />}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
