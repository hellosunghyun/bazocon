import { z } from "zod"
import { QUESTION_STATUSES, SESSION_KINDS } from "@/lib/types"

export const SessionRowSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  speaker: z.string().nullable(),
  starts_at: z.string(),
  ends_at: z.string().nullable(),
  kind: z.enum(SESSION_KINDS),
  sort_order: z.number(),
  is_public_qna_enabled: z.boolean(),
})

export const QuestionRowSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  body: z.string(),
  nickname: z.string(),
  status: z.enum(QUESTION_STATUSES),
  is_pinned: z.boolean(),
  author_visitor_id_hash: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const VoteRowSchema = z.object({
  question_id: z.string(),
  visitor_id_hash: z.string(),
  created_at: z.string(),
})

export const EventStateRowSchema = z.object({
  current_session_id: z.string().nullable(),
  notice: z.string().nullable(),
  updated_at: z.string(),
})

export const CreateQuestionSchema = z.object({
  body: z.string().trim().min(2).max(500),
  nickname: z.string().trim().min(1).max(32).optional(),
  visitorId: z.string().trim().min(8).max(128),
})

export const VoteQuestionSchema = z.object({
  visitorId: z.string().trim().min(8).max(128),
})

export const QuestionStatusUpdateSchema = z.object({
  status: z.enum(QUESTION_STATUSES),
})

export const PinUpdateSchema = z.object({
  isPinned: z.boolean(),
})

export const EventStateUpdateSchema = z.object({
  currentSessionId: z.string().nullable(),
  notice: z.string().trim().max(160).nullable().optional(),
})
