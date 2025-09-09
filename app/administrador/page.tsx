"use client"
import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin-login"
import { AdminHeader } from "@/components/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { isAuthenticated } from "@/lib/auth"
import { Users, Calendar, Trophy, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsAuth(isAuthenticated())
    setIsLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuth(true)
  }

  const handleLogout = () => {
    setIsAuth(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onLogout={handleLogout} />

      <main className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gerenciar Times</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Adicionar, editar e remover times do campeonato</p>
              <Link href="/administrador/times">
                <Button className="w-full bg-[#007fcc] hover:bg-[#006bb3]">Gerenciar Times</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gerenciar Jogos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Registrar resultados e agendar partidas</p>
              <Link href="/administrador/jogos">
                <Button className="w-full bg-[#007fcc] hover:bg-[#006bb3]">Gerenciar Jogos</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tabela</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Visualizar classificação atual do campeonato</p>
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Tabela
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rankings</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Artilheiros, assistências e goleiros</p>
              <Link href="/rankings">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Rankings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
