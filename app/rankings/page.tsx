import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayerGoalStats, PlayerAssistStats, GoalkeeperStats, PlayerCardStats } from "@/lib/types"
import { Trophy, Target, Users, Shield, CreditCard, Square, SquareX } from "lucide-react"
import Image from "next/image"
import RankingsClient from "./rankings-client"

// Add revalidation to update the page every 60 seconds as a fallback
export const revalidate = 60

export default async function RankingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#007fcc] text-white p-4">
        <h1 className="text-xl font-bold text-center">Brasileirão Fanfarrões</h1>
        <p className="text-center text-sm opacity-90">Rankings</p>
      </header>

      <main className="p-4 space-y-6">
        <RankingsClient />
      </main>
    </div>
  )
}
