import { formatDuration, formatKoreanTime } from "@/lib/format"
import type { Session } from "@/lib/types"

type TimetableRow =
  | {
      readonly kind: "session"
      readonly session: Session
    }
  | {
      readonly kind: "gap"
      readonly id: string
      readonly startsAt: string
      readonly endsAt: string
    }

export function ScheduleTimetable({ sessions }: { readonly sessions: readonly Session[] }) {
  const rows = buildTimetableRows(sessions)

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <colgroup>
          <col className="w-[4.8rem] sm:w-[5.6rem]" />
          <col className="w-[3.8rem] sm:w-[4.8rem]" />
          <col />
        </colgroup>
        <tbody className="divide-y divide-zinc-200">
          {rows.map((row) => row.kind === "gap" ? <GapRow key={row.id} row={row} /> : <SessionRow key={row.session.id} session={row.session} />)}
        </tbody>
      </table>
    </div>
  )
}

function SessionRow({ session }: { readonly session: Session }) {
  return (
    <tr className="align-top">
      <td className="whitespace-nowrap bg-zinc-50 px-3 py-3 font-mono font-bold text-zinc-500">
        {formatKoreanTime(session.startsAt)}
      </td>
      <td className="whitespace-nowrap bg-zinc-50 px-2 py-3 font-mono text-xs font-black text-cyan-700">
        {session.endsAt === null ? "" : formatDuration(session.startsAt, session.endsAt)}
      </td>
      <td className="min-w-0 px-3 py-3">
        <span className="block font-semibold leading-6 [overflow-wrap:anywhere]">{session.title}</span>
        {session.speaker === null ? null : (
          <span className="mt-1 block text-xs font-semibold text-zinc-500 [overflow-wrap:anywhere]">{session.speaker}</span>
        )}
      </td>
    </tr>
  )
}

function GapRow({ row }: { readonly row: Extract<TimetableRow, { readonly kind: "gap" }> }) {
  return (
    <tr>
      <td colSpan={3} className="bg-cyan-50 px-3 py-2">
        <div className="flex items-center justify-between gap-3 text-xs font-black text-cyan-900">
          <span className="whitespace-nowrap font-mono">{formatKoreanTime(row.startsAt)}</span>
          <span className="h-px flex-1 bg-cyan-200" />
          <span className="whitespace-nowrap rounded-full bg-white px-3 py-1 shadow-sm">
            쉬는 시간 · {formatDuration(row.startsAt, row.endsAt)}
          </span>
        </div>
      </td>
    </tr>
  )
}

function buildTimetableRows(sessions: readonly Session[]): readonly TimetableRow[] {
  return sessions.flatMap((session, index) => {
    const previous = sessions[index - 1]
    const gap = previous?.endsAt === undefined ? [] : makeGap(previous.endsAt, session.startsAt)
    return [...gap, { kind: "session" as const, session }]
  })
}

function makeGap(previousEndsAt: string | null, nextStartsAt: string): readonly TimetableRow[] {
  if (previousEndsAt === null) {
    return []
  }
  if (new Date(nextStartsAt).getTime() <= new Date(previousEndsAt).getTime()) {
    return []
  }
  return [{ kind: "gap", id: `gap-${previousEndsAt}-${nextStartsAt}`, startsAt: previousEndsAt, endsAt: nextStartsAt }]
}
