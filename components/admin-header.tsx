"use client"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
import { LogOut, Shield } from "lucide-react"

interface AdminHeaderProps {
  onLogout: () => void
}

export function AdminHeader({ onLogout }: AdminHeaderProps) {
  const handleLogout = () => {
    logout()
    onLogout()
  }

  return (
    <header className="bg-[#007fcc] text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <div>
            <h1 className="text-lg font-bold">Painel Administrativo</h1>
            <p className="text-xs opacity-90">Brasileirão Fanfarrões</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/20">
          <LogOut className="h-4 w-4 mr-1" />
          Sair
        </Button>
      </div>
    </header>
  )
}
