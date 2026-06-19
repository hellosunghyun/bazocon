import { getSessionSnapshot } from "@/lib/data"
import { jsonError, jsonOk, requireSupabase } from "@/lib/http"
import { hashVisitorId } from "@/lib/security"
import { CreateQuestionSchema } from "@/lib/validation"

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const visitorId = new URL(request.url).searchParams.get("visitorId")
  const visitorHash = visitorId === null ? null : hashVisitorId(visitorId)
  const snapshot = await getSessionSnapshot(slug, visitorHash, false)
  if (snapshot === null) {
    return jsonError("세션을 찾을 수 없습니다.", 404)
  }
  return jsonOk(snapshot)
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const parsed = CreateQuestionSchema.safeParse(await request.json())
  if (!parsed.success) {
    return jsonError("질문 내용을 확인해주세요.", 400)
  }

  const ready = requireSupabase()
  if (ready.kind === "missing") {
    return jsonError("Supabase 환경변수가 설정되지 않았습니다.", 503)
  }

  const { slug } = await context.params
  const sessionResult = await ready.supabase
    .from("bazocon_sessions")
    .select("id,is_public_qna_enabled")
    .eq("slug", slug)
    .single()

  if (sessionResult.error !== null || sessionResult.data === null) {
    return jsonError("세션을 찾을 수 없습니다.", 404)
  }
  if (sessionResult.data.is_public_qna_enabled !== true) {
    return jsonError("이 세션은 질문을 받지 않습니다.", 403)
  }

  const insertResult = await ready.supabase.from("bazocon_questions").insert({
    session_id: sessionResult.data.id,
    body: parsed.data.body,
    nickname: parsed.data.nickname ?? "익명",
    author_visitor_id_hash: hashVisitorId(parsed.data.visitorId),
    status: "visible",
  })

  if (insertResult.error !== null) {
    return jsonError("질문 등록에 실패했습니다.", 500)
  }
  return jsonOk({ ok: true })
}
