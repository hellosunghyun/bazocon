"use client"

import { useCallback, useState } from "react"

export type AdminActionFeedback = {
  readonly activeAction: string | null
  readonly completedAction: string | null
  readonly start: (actionId: string) => void
  readonly complete: (actionId: string) => void
  readonly fail: (actionId: string) => void
}

export function useAdminActionFeedback(): AdminActionFeedback {
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [completedAction, setCompletedAction] = useState<string | null>(null)

  const start = useCallback((actionId: string) => {
    setActiveAction(actionId)
    setCompletedAction(null)
  }, [])

  const complete = useCallback((actionId: string) => {
    setActiveAction((current) => (current === actionId ? null : current))
    setCompletedAction(actionId)
    window.setTimeout(() => {
      setCompletedAction((current) => (current === actionId ? null : current))
    }, 900)
  }, [])

  const fail = useCallback((actionId: string) => {
    setActiveAction((current) => (current === actionId ? null : current))
  }, [])

  return { activeAction, completedAction, start, complete, fail }
}
