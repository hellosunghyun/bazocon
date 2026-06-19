import type { Session } from "@/lib/types"

export function formatTimeRange(session: Session): string {
  const start = formatKoreanTime(session.startsAt)
  if (session.endsAt === null) {
    return start
  }
  return `${start} · ${formatDuration(session.startsAt, session.endsAt)}`
}

export function sessionLabel(session: Session): string {
  return session.speaker === null ? session.title : `${session.title} / ${session.speaker}`
}

export function formatKoreanTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value))
}

export function formatDuration(startsAt: string, endsAt: string): string {
  const minutes = Math.max(1, Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000))
  if (minutes < 60) {
    return `${minutes}분`
  }

  const hours = Math.floor(minutes / 60)
  const restMinutes = minutes % 60
  return restMinutes === 0 ? `${hours}시간` : `${hours}시간 ${restMinutes}분`
}
