import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTeams } from "@/lib/team-management"
import { Users, Target, UserCheck, Shield } from "lucide-react"
import Image from "next/image"

export default async function TeamsPage() {
  let teams = []
  
  try {
    teams = await getTeams()
  } catch (error) {
    console.error('Error fetching teams:', error)
  }

  const getPositionName = (position: string) => {
    switch (position.toLowerCase()) {
      case "goleiro":
        return "Goleiro"
      case "zagueiro":
        return "Zagueiro"
      case "meio-campo":
      case "meio-campista":
        return "Meio-campo"
      case "atacante":
        return "Atacante"
      default:
        return position
    }
  }

  const getPositionIcon = (position: string) => {
    switch (position.toLowerCase()) {
      case "goleiro":
        return <Shield className="h-4 w-4" />
      case "zagueiro":
        return <Users className="h-4 w-4" />
      case "meio-campo":
      case "meio-campista":
        return <UserCheck className="h-4 w-4" />
      case "atacante":
        return <Target className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getPositionOrder = (position: string) => {
    switch (position.toLowerCase()) {
      case "goleiro":
        return 1
      case "zagueiro":
        return 2
      case "meio-campo":
      case "meio-campista":
        return 3
      case "atacante":
        return 4
      default:
        return 5
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#007fcc] text-white p-4">
        <h1 className="text-xl font-bold text-center">Brasileirão Fanfarrões</h1>
        <p className="text-center text-sm opacity-90">Times</p>
      </header>

      <main className="p-4 space-y-6">
        {teams.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Nenhum time cadastrado ainda</p>
            </CardContent>
          </Card>
        ) : (
          teams.map((team) => {
            const players = team.players || []

            return (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {team.logo && (
                      <Image
                        src={team.logo}
                        alt={team.name}
                        width={48}
                        height={48}
                        className="rounded"
                      />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{players.length} jogadores</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {players.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nenhum jogador cadastrado</p>
                  ) : (
                    <div className="space-y-2">
                      {players
                        .sort((a, b) => {
                          const positionDiff = getPositionOrder(a.position) - getPositionOrder(b.position)
                          if (positionDiff !== 0) return positionDiff
                          
                          // Se as posições são iguais, ordenar por número da camisa, depois por nome
                          if (a.number && b.number) {
                            return a.number - b.number
                          }
                          return a.name.localeCompare(b.name)
                        })
                        .map((player) => (
                          <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {getPositionIcon(player.position)}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{player.name}</p>
                                    {player.number && (
                                      <Badge variant="outline" className="text-xs">
                                        #{player.number}
                                      </Badge>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {getPositionName(player.position)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </main>
    </div>
  )
}
