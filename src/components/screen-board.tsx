"use client"

import { useCallback, useEffect, useState } from "react"
import { Pin, ThumbsUp } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { BazoconLogo } from "@/components/bazocon-logo"
import { getBrowserSupabase } from "@/lib/supabase/browser"
import type { Question, ScreenSnapshot } from "@/lib/types"
import { ScreenSnapshotSchema } from "@/lib/client-schemas"

export function ScreenBoard({
  initialSnapshot,
  mode,
}: {
  readonly initialSnapshot: ScreenSnapshot
  readonly mode: "current" | "fixed"
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const sessionSlug = snapshot.session?.slug ?? null

  const refresh = useCallback(async () => {
    const endpoint = mode === "current" ? "/api/screen/current" : sessionSlug === null ? null : `/api/screen/${sessionSlug}`
    if (endpoint === null) {
      return
    }
    const response = await fetch(endpoint, { cache: "no-store" })
    if (response.ok) {
      setSnapshot(ScreenSnapshotSchema.parse(await response.json()))
    }
  }, [mode, sessionSlug])

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
      .channel(`screen-${mode}-${snapshot.session?.id ?? "none"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bazocon_event_state" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "bazocon_questions" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "bazocon_question_votes" }, refresh)
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [mode, refresh, snapshot.session?.id])

  const visibleQuestions = snapshot.questions.filter((question) => question.status !== "answered")
  const answeredQuestions = snapshot.questions.filter((question) => question.status === "answered")

  return (
    <main className="min-h-dvh bg-[#f5f7f8] p-8 text-zinc-950">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="flex items-center"
      >
        <BazoconLogo />
      </motion.header>
      <AnimatePresence mode="wait">
        {snapshot.session === null ? (
          <motion.section
            key="empty-session"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
            className="grid min-h-[70dvh] place-items-center text-center"
          >
            <h1 className="text-5xl font-bold">현재 띄울 발표가 없습니다.</h1>
          </motion.section>
        ) : (
          <motion.section
            key={snapshot.session.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-8 flex min-h-[calc(100dvh-9rem)] flex-col gap-8"
          >
            <motion.div layout className="min-w-0 border-b border-zinc-200 pb-6">
              <p className="text-sm font-black text-cyan-700">현재 질문 받는 중</p>
              <h1 className="mt-3 max-w-[22em] text-3xl font-black leading-tight [overflow-wrap:anywhere] sm:text-4xl">
                {snapshot.session.title}
              </h1>
              {snapshot.session.speaker === null ? null : (
                <p className="mt-3 text-xl font-bold text-cyan-700 [overflow-wrap:anywhere] sm:text-2xl">
                  {snapshot.session.speaker}
                </p>
              )}
            </motion.div>
            <motion.div layout className="min-h-0 flex-1 space-y-4">
              <AnimatePresence initial={false} mode="popLayout">
                {visibleQuestions.map((question) => (
                  <ScreenQuestion key={question.id} question={question} />
                ))}
                {visibleQuestions.length === 0 ? (
                  <motion.p
                    key="empty-questions"
                    initial={{ opacity: 0, y: 12, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.99 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="grid min-h-[18rem] place-items-center rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-3xl text-zinc-500"
                  >
                    아직 띄울 질문이 없습니다.
                  </motion.p>
                ) : null}
              </AnimatePresence>
              {answeredQuestions.length > 0 ? (
                <motion.p layout className="pt-4 text-sm font-semibold text-zinc-600">
                  답변완료 {answeredQuestions.length}개
                </motion.p>
              ) : null}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}

function ScreenQuestion({ question }: { readonly question: Question }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.99 }}
      transition={{ duration: 0.24, ease: "easeOut", layout: { duration: 0.24, ease: "easeOut" } }}
      className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="min-w-0 text-3xl font-bold leading-snug [overflow-wrap:anywhere]">{question.body}</p>
        {question.isPinned ? (
          <motion.span initial={{ scale: 0.75 }} animate={{ scale: 1 }} transition={{ duration: 0.18 }}>
            <Pin className="h-7 w-7 shrink-0 text-cyan-700" />
          </motion.span>
        ) : null}
      </div>
      <div className="mt-5 flex items-center gap-4 text-zinc-600">
        <span>{question.nickname}</span>
        <span className="inline-flex items-center gap-2">
          <ThumbsUp className="h-5 w-5" />
          {question.voteCount}
        </span>
      </div>
    </motion.article>
  )
}
