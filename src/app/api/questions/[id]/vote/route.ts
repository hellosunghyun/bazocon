import { jsonError, jsonOk, requireSupabase } from "@/lib/http"
import { hashVisitorId } from "@/lib/security"
import { VoteQuestionSchema } from "@/lib/validation"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const parsed = VoteQuestionSchema.safeParse(await request.json())
  if (!parsed.success) {
    return jsonError("방문자 정보를 확인할 수 없습니다.", 400)
  }

  const ready = requireSupabase()
  if (ready.kind === "missing") {
    return jsonError("Supabase 환경변수가 설정되지 않았습니다.", 503)
  }

  const { id } = await context.params
  const visitorHash = hashVisitorId(parsed.data.visitorId)
  const question = await ready.supabase
    .from("bazocon_questions")
    .select("author_visitor_id_hash")
    .eq("id", id)
    .single()

  if (question.error !== null || question.data === null) {
    return jsonError("질문을 찾을 수 없습니다.", 404)
  }
  if (question.data.author_visitor_id_hash === visitorHash) {
    return jsonError("본인 질문은 추천할 수 없습니다.", 403)
  }

  const existing = await ready.supabase
    .from("bazocon_question_votes")
    .select("question_id")
    .eq("question_id", id)
    .eq("visitor_id_hash", visitorHash)
    .maybeSingle()

  if (existing.error !== null) {
    return jsonError("추천 상태 확인에 실패했습니다.", 500)
  }

  if (existing.data === null) {
    const insertResult = await ready.supabase
      .from("bazocon_question_votes")
      .insert({ question_id: id, visitor_id_hash: visitorHash })
    if (insertResult.error !== null) {
      return jsonError("추천에 실패했습니다.", 500)
    }
    return jsonOk({ ok: true, voted: true })
  }

  const deleteResult = await ready.supabase
    .from("bazocon_question_votes")
    .delete()
    .eq("question_id", id)
    .eq("visitor_id_hash", visitorHash)

  if (deleteResult.error !== null) {
    return jsonError("추천 취소에 실패했습니다.", 500)
  }
  return jsonOk({ ok: true, voted: false })
}
