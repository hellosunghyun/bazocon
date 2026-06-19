import type { AppSnapshot, EventState, Question, ScreenSnapshot, SessionSnapshot } from "@/lib/types"
import { FALLBACK_EVENT_STATE, FALLBACK_SESSIONS, resolveCurrentSession } from "@/lib/schedule"
import { mapEventState, mapQuestion, mapSession, sortQuestions } from "@/lib/mappers"
import { QuestionRowSchema, VoteRowSchema } from "@/lib/validation"
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase/server"

export async function getAppSnapshot(): Promise<AppSnapshot> {
  const supabase = getServiceSupabase()
  if (supabase === null) {
    return fallbackAppSnapshot()
  }

  const [sessionsResult, eventResult] = await Promise.all([
    supabase.from("bazocon_sessions").select("*").order("sort_order"),
    supabase.from("bazocon_event_state").select("*").single(),
  ])

  if (sessionsResult.error !== null || eventResult.error !== null) {
    return fallbackAppSnapshot()
  }

  return {
    sessions: sessionsResult.data.map(mapSession),
    eventState: mapEventState(eventResult.data),
    isSupabaseConfigured: true,
  }
}

export async function getSessionSnapshot(
  slug: string,
  visitorHash: string | null,
  includeHidden: boolean,
): Promise<SessionSnapshot | null> {
  const app = await getAppSnapshot()
  const session = app.sessions.find((item) => item.slug === slug)
  if (session === undefined) {
    return null
  }
  const questions = await getQuestionsForSession(session.id, visitorHash, includeHidden)
  return { ...app, session, questions }
}

export async function getCurrentScreenSnapshot(): Promise<ScreenSnapshot> {
  const app = await getAppSnapshot()
  const session = resolveCurrentSession(app.sessions, app.eventState, new Date())
  const questions =
    session === null ? [] : await getQuestionsForSession(session.id, null, false)
  return { ...app, session, questions }
}

export async function getScreenSnapshot(slug: string): Promise<ScreenSnapshot | null> {
  const app = await getAppSnapshot()
  const session = app.sessions.find((item) => item.slug === slug)
  if (session === undefined) {
    return null
  }
  const questions = await getQuestionsForSession(session.id, null, false)
  return { ...app, session, questions }
}

export function fallbackAppSnapshot(): AppSnapshot {
  return {
    sessions: FALLBACK_SESSIONS,
    eventState: FALLBACK_EVENT_STATE,
    isSupabaseConfigured: isSupabaseConfigured(),
  }
}

async function getQuestionsForSession(
  sessionId: string,
  visitorHash: string | null,
  includeHidden: boolean,
): Promise<readonly Question[]> {
  const supabase = getServiceSupabase()
  if (supabase === null) {
    return []
  }

  const query = supabase
    .from("bazocon_questions")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })

  const questionsResult = includeHidden
    ? await query
    : await query.in("status", ["visible", "answered"])

  if (questionsResult.error !== null) {
    return []
  }

  const questionRows = QuestionRowSchema.array().parse(questionsResult.data)
  const questionIds = questionRows.map((question) => question.id)
  if (questionIds.length === 0) {
    return []
  }

  const votesResult = await supabase
    .from("bazocon_question_votes")
    .select("*")
    .in("question_id", questionIds)

  if (votesResult.error !== null) {
    return sortQuestions(
      questionRows.map((row) => mapQuestion(row, 0, false, isOwnQuestion(row.author_visitor_id_hash, visitorHash))),
    )
  }

  const votes = VoteRowSchema.array().parse(votesResult.data)
  const counts = new Map<string, number>()
  const userVotes = new Set<string>()

  for (const vote of votes) {
    counts.set(vote.question_id, (counts.get(vote.question_id) ?? 0) + 1)
    if (visitorHash !== null && vote.visitor_id_hash === visitorHash) {
      userVotes.add(vote.question_id)
    }
  }

  return sortQuestions(
    questionRows.map((row) =>
      mapQuestion(row, counts.get(row.id) ?? 0, userVotes.has(row.id), isOwnQuestion(row.author_visitor_id_hash, visitorHash)),
    ),
  )
}

function isOwnQuestion(authorHash: string | null | undefined, visitorHash: string | null): boolean {
  return authorHash !== null && authorHash !== undefined && visitorHash !== null && authorHash === visitorHash
}

export function serializeEventState(eventState: EventState): EventState {
  return eventState
}
