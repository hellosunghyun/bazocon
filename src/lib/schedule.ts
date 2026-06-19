import type { EventState, Session } from "@/lib/types"

export const FALLBACK_EVENT_STATE: EventState = {
  currentSessionId: null,
  notice: null,
  updatedAt: "2026-06-20T04:00:00.000Z",
}

export const FALLBACK_SESSIONS: readonly Session[] = [
  session("entry", "입장", null, "2026-06-20T04:30:00.000Z", "2026-06-20T05:00:00.000Z", "entry", 10, false),
  session("opening", "오프닝", null, "2026-06-20T05:00:00.000Z", "2026-06-20T05:05:00.000Z", "opening", 20, false),
  session("ranolp-adt-church-encoding", "Algebraic Data Type for FUN", "RanolP", "2026-06-20T05:10:00.000Z", "2026-06-20T05:30:00.000Z", "talk", 30, true),
  session("helloyunho-playstation-shell", "바보같은 PlayStation 셸", "Helloyunho", "2026-06-20T05:40:00.000Z", "2026-06-20T06:00:00.000Z", "talk", 40, true),
  session("sunmin-neuro-developer", "신경질환자, 개발자로 살아남기", "김선민", "2026-06-20T06:10:00.000Z", "2026-06-20T06:30:00.000Z", "talk", 50, true),
  session("sudori-game-overlay", "나만의 고성능 게임 오버레이 만들기", "스도리", "2026-06-20T06:40:00.000Z", "2026-06-20T07:00:00.000Z", "talk", 60, true),
  session("hong-minhee-gukhanmun", "Gukhanmun: 國漢文을 한글로 바꾸기", "홍민희", "2026-06-20T07:10:00.000Z", "2026-06-20T07:30:00.000Z", "talk", 70, true),
  session("lightning-margin", "라이트닝 토크", null, "2026-06-20T07:30:00.000Z", "2026-06-20T08:00:00.000Z", "break", 80, false),
  session("closing", "기념 촬영", null, "2026-06-20T08:00:00.000Z", "2026-06-20T08:05:00.000Z", "closing", 90, false),
  session("networking", "피자를 먹으며 네트워킹", null, "2026-06-20T08:05:00.000Z", "2026-06-20T10:00:00.000Z", "networking", 100, false),
]

function session(
  slug: string,
  title: string,
  speaker: string | null,
  startsAt: string,
  endsAt: string | null,
  kind: Session["kind"],
  sortOrder: number,
  isPublicQnaEnabled: boolean,
): Session {
  return {
    id: slug,
    slug,
    title,
    speaker,
    startsAt,
    endsAt,
    kind,
    sortOrder,
    isPublicQnaEnabled,
  }
}

export function getFallbackCurrentSession(now: Date): Session | null {
  return FALLBACK_SESSIONS.find((item) => isSessionActive(item, now)) ?? null
}

export function isSessionActive(sessionItem: Session, now: Date): boolean {
  const startsAt = new Date(sessionItem.startsAt)
  const endsAt = sessionItem.endsAt === null ? null : new Date(sessionItem.endsAt)
  return startsAt <= now && (endsAt === null || now < endsAt)
}

export function resolveCurrentSession(
  sessions: readonly Session[],
  eventState: EventState,
  now: Date,
): Session | null {
  const override = sessions.find((item) => item.id === eventState.currentSessionId)
  if (override !== undefined) {
    return override
  }
  return sessions.find((item) => isSessionActive(item, now)) ?? null
}
