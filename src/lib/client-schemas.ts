import { z } from "zod"
import { QUESTION_STATUSES, SESSION_KINDS } from "@/lib/types"

export const ClientSessionSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  speaker: z.string().nullable(),
  startsAt: z.string(),
  endsAt: z.string().nullable(),
  kind: z.enum(SESSION_KINDS),
  sortOrder: z.number(),
  isPublicQnaEnabled: z.boolean(),
})

export const ClientQuestionSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  body: z.string(),
  nickname: z.string(),
  status: z.enum(QUESTION_STATUSES),
  isPinned: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  voteCount: z.number(),
  hasVoted: z.boolean(),
  isOwn: z.boolean(),
})

export const ClientEventStateSchema = z.object({
  currentSessionId: z.string().nullable(),
  notice: z.string().nullable(),
  updatedAt: z.string(),
})

export const AppSnapshotSchema = z.object({
  sessions: ClientSessionSchema.array(),
  eventState: ClientEventStateSchema,
  isSupabaseConfigured: z.boolean(),
})

export const SessionSnapshotSchema = AppSnapshotSchema.extend({
  session: ClientSessionSchema,
  questions: ClientQuestionSchema.array(),
})

export const ScreenSnapshotSchema = AppSnapshotSchema.extend({
  session: ClientSessionSchema.nullable(),
  questions: ClientQuestionSchema.array(),
})
