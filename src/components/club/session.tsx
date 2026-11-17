'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AppUser } from '@/lib/club-types'

const SessionContext = createContext<{
  user: AppUser | null
  loading: boolean
  refresh: () => Promise<void>
}>({ user: null, loading: true, refresh: async () => {} })
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const refresh = async () => {
    try {
      const response = await fetch('/api/club/session')
      const data = await response.json()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void refresh()
  }, [])
  return (
    <SessionContext.Provider value={{ user, loading, refresh }}>{children}</SessionContext.Provider>
  )
}
export const useSession = () => useContext(SessionContext)
export async function clubRequest(action: string, body: unknown) {
  const response = await fetch(`/api/club/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? 'Хүсэлт амжилтгүй боллоо.')
  return data
}
