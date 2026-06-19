import type { EventState, Question, Session } from "@/lib/types"
import { EventStateRowSchema, QuestionRowSchema, SessionRowSchema } from "@/lib/validation"

export function mapSession(row: unknown): Session {
  const parsed = SessionRowSchema.parse(row)
  return {
    id: parsed.id,
    slug: parsed.slug,
    title: parsed.title,
    speaker: parsed.speaker,
    startsAt: parsed.starts_at,
    endsAt: parsed.ends_at,
    kind: parsed.kind,
    sortOrder: parsed.sort_order,
    isPublicQnaEnabled: parsed.is_public_qna_enabled,
  }
}

export function mapQuestion(
  row: unknown,
  voteCount: number,
  hasVoted: boolean,
  isOwn: boolean,
): Question {
  const parsed = QuestionRowSchema.parse(row)
  return {
    id: parsed.id,
    sessionId: parsed.session_id,
    body: parsed.body,
    nickname: parsed.nickname,
    status: parsed.status,
    isPinned: parsed.is_pinned,
    createdAt: parsed.created_at,
    updatedAt: parsed.updated_at,
    voteCount,
    hasVoted,
    isOwn,
  }
}

export function mapEventState(row: unknown): EventState {
  const parsed = EventStateRowSchema.parse(row)
  return {
    currentSessionId: parsed.current_session_id,
    notice: parsed.notice,
    updatedAt: parsed.updated_at,
  }
}

export function sortQuestions(questions: readonly Question[]): readonly Question[] {
  return [...questions].sort((left, right) => {
    if (left.isPinned !== right.isPinned) {
      return left.isPinned ? -1 : 1
    }
    if (left.status !== right.status) {
      return left.status === "answered" ? 1 : -1
    }
    if (left.voteCount !== right.voteCount) {
      return right.voteCount - left.voteCount
    }
    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  })
}
