"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "bazocon.visitorId"

export function useVisitorId(): string | null {
  const [visitorId, setVisitorId] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const existing = window.localStorage.getItem(STORAGE_KEY)
      if (existing !== null) {
        setVisitorId(existing)
        return
      }
      const created = window.crypto.randomUUID()
      window.localStorage.setItem(STORAGE_KEY, created)
      setVisitorId(created)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  return visitorId
}
