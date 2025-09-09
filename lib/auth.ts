"use client"

import { prisma } from './prisma'
import * as bcrypt from 'bcryptjs'

// Simple auth for demo purposes - in production, use proper authentication
export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "fanfarroes2024",
}

export async function createAdmin(username: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  
  return await prisma.admin.create({
    data: {
      username,
      password: hashedPassword
    }
  })
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { username }
    })
    
    if (!admin) {
      // Fallback para credenciais hardcoded durante desenvolvimento
      return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
    }
    
    return await bcrypt.compare(password, admin.password)
  } catch (error) {
    // Fallback para credenciais hardcoded se o banco não estiver disponível
    return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
  }
}

export function login(username: string, password: string): boolean {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    localStorage.setItem("isAdminAuthenticated", "true")
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem("isAdminAuthenticated")
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("isAdminAuthenticated") === "true"
}
