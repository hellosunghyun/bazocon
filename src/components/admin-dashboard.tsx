"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { Panel } from "@/components/admin-panel"
import { AdminQuickLinks } from "@/components/admin-quick-links"
import { AdminOverridePanel, currentSessionActionId } from "@/components/admin-override-panel"
import { AdminQuestion, questionPinActionId } from "@/components/admin-question"
import { AdminResetPanel, RESET_QUESTIONS_ACTION_ID } from "@/components/admin-reset-panel"
import { BazoconLogo } from "@/components/bazocon-logo"
import { ConnectionBadge } from "@/components/connection-badge"
import { useAdminActionFeedback } from "@/hooks/use-admin-action-feedback"
import { formatTimeRange } from "@/lib/format"
import { getBrowserSupabase } from "@/lib/supabase/browser"
import type { AppSnapshot, EventState, Question, QuestionStatus, SessionSnapshot } from "@/lib/types"
import { ClientEventStateSchema, SessionSnapshotSchema } from "@/lib/client-schemas"

type AdminFilter = "visible" | "hidden" | "answered"

export function AdminDashboard({
  initialApp,
  initialSession,
}: {
  readonly initialApp: AppSnapshot
  readonly initialSession: SessionSnapshot | null
}) {
  const firstSession = initialSession?.session.slug ?? initialApp.sessions.find((item) => item.isPublicQnaEnabled)?.slug ?? ""
  const [selectedSlug, setSelectedSlug] = useState(firstSession)
  const [snapshot, setSnapshot] = useState(initialSession)
  const [eventState, setEventState] = useState(initialApp.eventState)
  const [overrideMessage, setOverrideMessage] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [filter, setFilter] = useState<AdminFilter>("visible")
  const [isPending, startTransition] = useTransition()
  const actionFeedback = useAdminActionFeedback()
  const qnaSessions = initialApp.sessions.filter((session) => session.isPublicQnaEnabled)
  const selectedLinkSession = qnaSessions.find((session) => session.slug === selectedSlug) ?? null
  const filteredQuestions = useMemo(
    () => snapshot?.questions.filter((question) => question.status === filter) ?? [],
    [filter, snapshot],
  )

  const refresh = useCallback(async () => {
    if (selectedSlug.length === 0) {
      return
    }
    const response = await fetch(`/api/admin/sessions/${selectedSlug}`, { cache: "no-store" })
    if (response.ok) {
      const nextSnapshot = SessionSnapshotSchema.parse(await response.json())
      setSnapshot(nextSnapshot)
      setEventState(nextSnapshot.eventState)
    }
  }, [selectedSlug])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  useEffect(() => {
    const supabase = getBrowserSupabase()
    if (supabase === null || snapshot === null) {
      return
    }
    const channel = supabase
      .channel(`admin-${snapshot.session.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bazocon_questions", filter: `session_id=eq.${snapshot.session.id}` },
        refresh,
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "bazocon_question_votes" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "bazocon_event_state" }, refresh)
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [refresh, snapshot])

  function setCurrentSession(sessionId: string | null) {
    const actionId = currentSessionActionId(sessionId)
    const previousEventState = eventState
    actionFeedback.start(actionId)
    setEventState(makeOptimisticEventState(eventState, sessionId))
    setOverrideMessage("적용 중")

    startTransition(async () => {
      const response = await fetch("/api/admin/event-state", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentSessionId: sessionId }),
      })
      if (!response.ok) {
        setEventState(previousEventState)
        setOverrideMessage("적용 실패")
        actionFeedback.fail(actionId)
        return
      }
      const payload = await response.json()
      setEventState(ClientEventStateSchema.parse(payload.eventState))
      setOverrideMessage("적용됨")
      actionFeedback.complete(actionId)
      await refresh()
    })
  }

  function updateQuestionStatus(question: Question, status: QuestionStatus, actionId: string) {
    actionFeedback.start(actionId)
    startTransition(async () => {
      const response = await fetch(`/api/admin/questions/${question.id}/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        actionFeedback.fail(actionId)
        return
      }
      actionFeedback.complete(actionId)
      await refresh()
    })
  }

  function updatePin(question: Question) {
    const actionId = questionPinActionId(question.id)
    actionFeedback.start(actionId)
    startTransition(async () => {
      const response = await fetch(`/api/admin/questions/${question.id}/pin`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isPinned: !question.isPinned }),
      })
      if (!response.ok) {
        actionFeedback.fail(actionId)
        return
      }
      actionFeedback.complete(actionId)
      await refresh()
    })
  }

  function resetSelectedSessionQuestions() {
    if (snapshot === null) {
      return
    }

    const confirmed = window.confirm(
      `${snapshot.session.title} 세션의 질문과 추천을 모두 초기화할까요? 이 작업은 되돌릴 수 없습니다.`,
    )
    if (!confirmed) {
      return
    }

    setResetMessage("초기화 중")
    actionFeedback.start(RESET_QUESTIONS_ACTION_ID)
    startTransition(async () => {
      const response = await fetch(`/api/admin/sessions/${snapshot.session.slug}/questions/reset`, {
        method: "POST",
      })
      if (!response.ok) {
        setResetMessage("초기화 실패")
        actionFeedback.fail(RESET_QUESTIONS_ACTION_ID)
        return
      }
      setResetMessage("질문을 초기화했습니다.")
      actionFeedback.complete(RESET_QUESTIONS_ACTION_ID)
      await refresh()
    })
  }

  return (
    <main className="min-h-dvh bg-[#f5f7f8] text-zinc-950">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <BazoconLogo />
        <ConnectionBadge configured={initialApp.isSupabaseConfigured} />
      </header>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-12 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <AdminOverridePanel
            eventState={eventState}
            qnaSessions={qnaSessions}
            activeAction={actionFeedback.activeAction}
            completedAction={actionFeedback.completedAction}
            overrideMessage={overrideMessage}
            onSetCurrentSession={setCurrentSession}
          />
          <Panel title="관리 대상 세션">
            <select
              value={selectedSlug}
              onChange={(event) => setSelectedSlug(event.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              {qnaSessions.map((session) => (
                <option key={session.id} value={session.slug}>
                  {session.speaker ?? session.title}
                </option>
              ))}
            </select>
          </Panel>
          <AdminQuickLinks selectedSession={selectedLinkSession} />
          <AdminResetPanel
            snapshot={snapshot}
            activeAction={actionFeedback.activeAction}
            completedAction={actionFeedback.completedAction}
            resetMessage={resetMessage}
            onReset={resetSelectedSessionQuestions}
          />
        </aside>
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-cyan-700">
                {snapshot === null ? "질문 없음" : formatTimeRange(snapshot.session)}
              </p>
              <h1 className="mt-1 text-2xl font-bold">{snapshot?.session.title ?? "세션을 선택하세요"}</h1>
            </div>
            <div className="flex gap-2">
              {(["visible", "hidden", "answered"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-md px-3 py-2 text-sm font-bold ${
                    filter === item ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 space-y-3 opacity-100 data-[pending=true]:opacity-60" data-pending={isPending}>
            {filteredQuestions.map((question) => (
              <AdminQuestion
                key={question.id}
                question={question}
                activeAction={actionFeedback.activeAction}
                completedAction={actionFeedback.completedAction}
                onPin={updatePin}
                onStatus={updateQuestionStatus}
              />
            ))}
            {filteredQuestions.length === 0 ? (
              <p className="rounded-md border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
                이 필터에 질문이 없습니다.
              </p>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  )
}

function makeOptimisticEventState(eventState: EventState, currentSessionId: string | null): EventState {
  return {
    ...eventState,
    currentSessionId,
    updatedAt: new Date().toISOString(),
  }
}
