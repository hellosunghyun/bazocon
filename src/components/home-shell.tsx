"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { CalendarDays, MessageSquare, Users } from "lucide-react"
import { motion } from "motion/react"
import { ConnectionBadge } from "@/components/connection-badge"
import { BazoconLogo } from "@/components/bazocon-logo"
import { ScheduleTimetable } from "@/components/schedule-timetable"
import { formatTimeRange } from "@/lib/format"
import { resolveCurrentSession } from "@/lib/schedule"
import { getBrowserSupabase } from "@/lib/supabase/browser"
import type { AppSnapshot } from "@/lib/types"
import { AppSnapshotSchema } from "@/lib/client-schemas"

export function HomeShell({ initialSnapshot }: { readonly initialSnapshot: AppSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const currentSession = useMemo(
    () => resolveCurrentSession(snapshot.sessions, snapshot.eventState, new Date()),
    [snapshot],
  )
  const qnaSessions = snapshot.sessions.filter((session) => session.isPublicQnaEnabled)

  const refresh = useCallback(async () => {
    const response = await fetch("/api/app", { cache: "no-store" })
    if (!response.ok) {
      return
    }
    setSnapshot(AppSnapshotSchema.parse(await response.json()))
  }, [])

  useEffect(() => {
    const supabase = getBrowserSupabase()
    if (supabase === null) {
      return
    }
    const channel = supabase
      .channel("home-state")
      .on("postgres_changes", { event: "*", schema: "public", table: "bazocon_event_state" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "bazocon_sessions" }, refresh)
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [refresh])

  return (
    <main className="min-h-dvh bg-[#f5f7f8] text-zinc-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <BazoconLogo />
        <ConnectionBadge configured={snapshot.isSupabaseConfigured} />
      </header>
      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-cyan-700">행사 안내</p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              BAZOCON
            </h1>
            <div className="mt-5 grid gap-3 text-sm text-zinc-700">
              <p className="flex gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 text-cyan-700" />
                2026년 6월 20일 토요일 14:00
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.04, ease: "easeOut" }}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-700" />
              <h2 className="text-lg font-bold">안내</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-zinc-700">
              <li>네트워킹 시작 전 30초 자기소개 시간이 있습니다.</li>
              <li>각 발표에 대한 질문은 아래 질문방에 남겨주세요. 추천 수는 실시간으로 반영됩니다.</li>
              <li>
                정해진 시간표 안에서 진행하기 위해 추천 수와 질문 내용을 참고해 답변할 질문을 선별할
                예정입니다. 시간이 부족할 경우 일부 질문은 다루지 못할 수 있습니다.
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.08, ease: "easeOut" }}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-cyan-700" />
              <h2 className="text-lg font-bold">발표별 질문방</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {qnaSessions.map((session) => (
                <motion.div key={session.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
                  <Link
                    href={`/s/${session.slug}`}
                    className="block rounded-md border border-zinc-200 p-4 transition hover:border-cyan-500 hover:bg-cyan-50"
                  >
                    <p className="text-xs font-semibold text-zinc-500">{formatTimeRange(session)}</p>
                    <p className="mt-1 font-semibold">{session.title}</p>
                    <p className="mt-1 text-sm text-zinc-600">{session.speaker}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <aside className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.12, ease: "easeOut" }}
            className="rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm"
          >
            <p className="text-sm font-semibold text-cyan-300">현재 질문 받는 중</p>
            {currentSession === null ? (
              <p className="mt-3 text-2xl font-bold">설정된 발표 없음</p>
            ) : (
              <SessionTitleBlock session={currentSession} variant="dark" />
            )}
            {currentSession?.isPublicQnaEnabled === true ? (
              <Link
                href={`/s/${currentSession.slug}`}
                className="mt-5 inline-flex rounded-md bg-cyan-300 px-4 py-2 text-sm font-bold text-zinc-950"
              >
                현재 질문방 열기
              </Link>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.16, ease: "easeOut" }}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-bold">전체 스케줄</h2>
            <ScheduleTimetable sessions={snapshot.sessions} />
          </motion.div>
        </aside>
      </section>
    </main>
  )
}

function SessionTitleBlock({
  session,
  variant,
}: {
  readonly session: AppSnapshot["sessions"][number]
  readonly variant: "light" | "dark"
}) {
  const speakerClass = variant === "dark" ? "text-cyan-200" : "text-zinc-500"
  return (
    <span className="block">
      <span className="block font-semibold leading-6">{session.title}</span>
      {session.speaker === null ? null : (
        <span className={`mt-1 block text-xs font-semibold ${speakerClass}`}>
          {session.speaker}
        </span>
      )}
    </span>
  )
}
