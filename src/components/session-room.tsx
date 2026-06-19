"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ConnectionBadge } from "@/components/connection-badge"
import { BazoconLogo } from "@/components/bazocon-logo"
import { SessionNotice } from "@/components/session-notice"
import { QuestionCard } from "@/components/session-question-card"
import { useVisitorId } from "@/hooks/use-visitor-id"
import { formatTimeRange } from "@/lib/format"
import { resolveCurrentSession } from "@/lib/schedule"
import { getBrowserSupabase } from "@/lib/supabase/browser"
import type { Question, SessionSnapshot } from "@/lib/types"
import { SessionSnapshotSchema } from "@/lib/client-schemas"

export function SessionRoom({ initialSnapshot }: { readonly initialSnapshot: SessionSnapshot }) {
  const visitorId = useVisitorId()
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const [body, setBody] = useState("")
  const [nickname, setNickname] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [, startTransition] = useTransition()
  const currentSession = useMemo(
    () => resolveCurrentSession(snapshot.sessions, snapshot.eventState, new Date()),
    [snapshot],
  )
  const isCurrent = currentSession?.id === snapshot.session.id

  const refresh = useCallback(async () => {
    const suffix = visitorId === null ? "" : `?visitorId=${encodeURIComponent(visitorId)}`
    const response = await fetch(`/api/sessions/${snapshot.session.slug}${suffix}`, {
      cache: "no-store",
    })
    if (response.ok) {
      setSnapshot(SessionSnapshotSchema.parse(await response.json()))
    }
  }, [snapshot.session.slug, visitorId])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  useEffect(() => {
    const supabase = getBrowserSupabase()
    if (supabase === null) {
      return
    }
    const channel = supabase
      .channel(`session-${snapshot.session.id}`)
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
  }, [refresh, snapshot.session.id])

  function submitQuestion() {
    if (body.trim().length < 2) {
      setMessage("질문을 입력해주세요.")
      return
    }
    if (visitorId === null) {
      setMessage("브라우저 식별자를 준비 중입니다.")
      return
    }
    setIsSubmitting(true)
    void fetch(`/api/sessions/${snapshot.session.slug}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body, nickname: nickname || undefined, visitorId }),
    }).then((response) => {
      if (!response.ok) {
        setMessage("질문 등록에 실패했습니다.")
        return
      }
      setBody("")
      setMessage("질문을 등록했습니다.")
      void refresh()
    }).catch((error: unknown) => {
      if (error instanceof Error) {
        setMessage("질문 등록에 실패했습니다.")
        return
      }
      setMessage("질문 등록에 실패했습니다.")
    }).finally(() => {
      setIsSubmitting(false)
    })
  }

  function vote(question: Question) {
    if (visitorId === null) {
      setMessage("브라우저 식별자를 준비 중입니다.")
      return
    }
    if (question.isOwn) {
      setMessage("본인 질문은 추천할 수 없습니다.")
      return
    }
    startTransition(async () => {
      const response = await fetch(`/api/questions/${question.id}/vote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ visitorId }),
      })
      if (!response.ok) {
        setMessage("추천 처리에 실패했습니다.")
        return
      }
      await refresh()
    })
  }

  return (
    <main className={`min-h-dvh bg-[#f5f7f8] text-zinc-950 ${isCurrent ? "pb-10" : "pb-56 sm:pb-44"}`}>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600">
          <ArrowLeft className="h-4 w-4" />
          전체 일정
        </Link>
        <BazoconLogo />
      </header>
      <section className="mx-auto grid max-w-5xl gap-5 px-5 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <ConnectionBadge configured={snapshot.isSupabaseConfigured} />
            <p className="mt-4 text-sm font-semibold text-cyan-700">{formatTimeRange(snapshot.session)}</p>
            <h1 className="mt-2 text-2xl font-bold">{snapshot.session.title}</h1>
            <p className="mt-2 text-zinc-600">{snapshot.session.speaker}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.04, ease: "easeOut" }}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <label className="text-sm font-bold" htmlFor="nickname">
              이름
            </label>
            <input
              id="nickname"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-cyan-500"
              placeholder="익명"
            />
            <label className="mt-4 block text-sm font-bold" htmlFor="question">
              질문
            </label>
            <textarea
              id="question"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="mt-2 min-h-32 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-cyan-500"
              placeholder="발표자에게 남길 질문을 적어주세요."
            />
            <motion.button
              type="button"
              onClick={submitQuestion}
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              <Send className="h-4 w-4" />
              질문 등록
            </motion.button>
            {message === null ? null : <p className="mt-3 text-sm text-zinc-600">{message}</p>}
          </motion.div>
        </aside>
        <section className="space-y-3">
          <AnimatePresence mode="popLayout">
            {snapshot.questions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500"
              >
                아직 등록된 질문이 없습니다.
              </motion.div>
            ) : (
              snapshot.questions.map((question) => (
                <QuestionCard key={question.id} question={question} onVote={vote} />
              ))
            )}
          </AnimatePresence>
        </section>
      </section>
      {isCurrent ? null : <SessionNotice currentSession={currentSession} />}
    </main>
  )
}
