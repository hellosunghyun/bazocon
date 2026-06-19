import { touchEventState } from "@/lib/admin-realtime"
import { jsonError, jsonOk, requireAdmin, requireSupabase } from "@/lib/http"

export async function POST(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const authError = await requireAdmin()
  if (authError !== null) {
    return authError
  }

  const ready = requireSupabase()
  if (ready.kind === "missing") {
    return jsonError("Supabase 환경변수가 설정되지 않았습니다.", 503)
  }

  const { slug } = await context.params
  const session = await ready.supabase
    .from("bazocon_sessions")
    .select("id")
    .eq("slug", slug)
    .single()

  if (session.error !== null || session.data === null) {
    return jsonError("세션을 찾을 수 없습니다.", 404)
  }

  const deleted = await ready.supabase
    .from("bazocon_questions")
    .delete()
    .eq("session_id", session.data.id)
    .select("id")

  if (deleted.error !== null) {
    return jsonError("질문 초기화에 실패했습니다.", 500)
  }

  await ready.supabase.from("bazocon_admin_actions").insert({
    question_id: null,
    action: "reset_questions",
    before_state: { sessionId: session.data.id, questionCount: deleted.data.length },
    after_state: { questionCount: 0 },
  })

  if (!(await touchEventState(ready.supabase))) {
    return jsonError("질문은 초기화됐지만 실시간 갱신에 실패했습니다.", 500)
  }

  return jsonOk({ ok: true, deletedCount: deleted.data.length })
}
