export const QUESTION_STATUSES = ["visible", "hidden", "answered"] as const
export type QuestionStatus = (typeof QUESTION_STATUSES)[number]

export const SESSION_KINDS = [
  "setup",
  "entry",
  "opening",
  "talk",
  "break",
  "networking",
  "closing",
  "cleanup",
] as const
export type SessionKind = (typeof SESSION_KINDS)[number]

export type Session = {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly speaker: string | null
  readonly startsAt: string
  readonly endsAt: string | null
  readonly kind: SessionKind
  readonly sortOrder: number
  readonly isPublicQnaEnabled: boolean
}

export type Question = {
  readonly id: string
  readonly sessionId: string
  readonly body: string
  readonly nickname: string
  readonly status: QuestionStatus
  readonly isPinned: boolean
  readonly createdAt: string
  readonly updatedAt: string
  readonly voteCount: number
  readonly hasVoted: boolean
  readonly isOwn: boolean
}

export type EventState = {
  readonly currentSessionId: string | null
  readonly notice: string | null
  readonly updatedAt: string
}

export type AppSnapshot = {
  readonly sessions: readonly Session[]
  readonly eventState: EventState
  readonly isSupabaseConfigured: boolean
}

export type SessionSnapshot = AppSnapshot & {
  readonly session: Session
  readonly questions: readonly Question[]
}

export type ScreenSnapshot = AppSnapshot & {
  readonly session: Session | null
  readonly questions: readonly Question[]
}
