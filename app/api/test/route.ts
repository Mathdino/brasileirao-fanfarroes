import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT NOW()`
    
    // Try to count teams
    const teamCount = await prisma.team.count()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection working',
      currentTime: result,
      teamCount 
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}