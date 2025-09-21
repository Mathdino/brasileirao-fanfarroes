import { NextRequest, NextResponse } from 'next/server'
import { getTopScorers, getTopAssists, getTopGoalkeepers, getPlayerCardStats } from '@/lib/player-stats'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')

    switch (type) {
      case 'scorers':
        const topScorers = await getTopScorers(limit)
        return NextResponse.json(topScorers)
      
      case 'assists':
        const topAssists = await getTopAssists(limit)
        return NextResponse.json(topAssists)
      
      case 'goalkeepers':
        const topGoalkeepers = await getTopGoalkeepers(limit)
        return NextResponse.json(topGoalkeepers)
        
      case 'cards':
        const cardStats = await getPlayerCardStats(limit)
        return NextResponse.json(cardStats)
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter. Use: scorers, assists, goalkeepers, or cards' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching player statistics:', error)
    return NextResponse.json({ error: 'Failed to fetch player statistics' }, { status: 500 })
  }
}