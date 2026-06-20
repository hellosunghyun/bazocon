import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "motion/react"
import type { SessionSnapshot } from "@/lib/types"

export function SessionNotice({ currentSession }: { readonly currentSession: SessionSnapshot["session"] | null }) {
  if (currentSession === null) {
    return (
      <div className="app-bottom-notice fixed inset-x-0 bottom-0 z-20 border-t border-cyan-200 bg-cyan-50 px-5 pt-4 text-sm font-semibold text-cyan-950 shadow-lg">
        <div className="mx-auto max-w-5xl">현재 질문 받는 방이 설정되지 않았습니다. 질문은 남길 수 있습니다.</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="app-bottom-notice fixed inset-x-0 bottom-0 z-20 border-t-2 border-cyan-400 bg-white px-5 pt-4 text-cyan-950 shadow-[0_-10px_30px_rgba(14,116,144,0.18)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-normal text-cyan-700">현재 질문 받는 중</p>
          <p className="mt-1 text-base font-black leading-snug sm:text-lg">
            {currentSession.title}
            {currentSession.speaker === null ? null : <span className="text-zinc-500"> / {currentSession.speaker}</span>}
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-600">지금 페이지에도.</p>
        </div>
        <motion.div whileTap={{ scale: 0.98 }} className="shrink-0">
          <Link
            href={`/s/${currentSession.slug}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-cyan-800 sm:w-auto"
          >
            지금 세션으로 이동
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
