import { touchEventState } from "@/lib/admin-realtime"
import { jsonError, jsonOk, requireAdmin, requireSupabase } from "@/lib/http"
import { QuestionStatusUpdateSchema } from "@/lib/validation"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin()
  if (authError !== null) {
    return authError
  }

  const parsed = QuestionStatusUpdateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return jsonError("질문 상태를 확인해주세요.", 400)
  }

  const ready = requireSupabase()
  if (ready.kind === "missing") {
    return jsonError("Supabase 환경변수가 설정되지 않았습니다.", 503)
  }

  const { id } = await context.params
  const before = await ready.supabase.from("bazocon_questions").select("*").eq("id", id).single()
  if (before.error !== null || before.data === null) {
    return jsonError("질문을 찾을 수 없습니다.", 404)
  }

  const update = await ready.supabase
    .from("bazocon_questions")
    .update({ status: parsed.data.status })
    .eq("id", id)

  if (update.error !== null) {
    return jsonError("질문 상태 변경에 실패했습니다.", 500)
  }

  await ready.supabase.from("bazocon_admin_actions").insert({
    question_id: id,
    action: `status:${parsed.data.status}`,
    before_state: before.data,
    after_state: { status: parsed.data.status },
  })

  if (!(await touchEventState(ready.supabase))) {
    return jsonError("질문은 변경됐지만 실시간 갱신에 실패했습니다.", 500)
  }

  return jsonOk({ ok: true })
}
