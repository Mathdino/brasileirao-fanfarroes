"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Trophy, Users, BarChart3, Calendar, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Trophy, label: "Classificação" },
  { href: "/jogos", icon: Calendar, label: "Jogos" },
  { href: "/rankings", icon: BarChart3, label: "Rankings" },
  { href: "/times", icon: Users, label: "Times" },
  { href: "/administrador", icon: Settings, label: "Admin" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center py-2 px-3 text-xs transition-colors min-w-0",
              pathname === href ? "text-[#007fcc] font-semibold" : "text-gray-600 hover:text-[#007fcc]",
            )}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
