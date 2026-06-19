import { touchEventState } from "@/lib/admin-realtime"
import { jsonError, jsonOk, requireAdmin, requireSupabase } from "@/lib/http"
import { PinUpdateSchema } from "@/lib/validation"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin()
  if (authError !== null) {
    return authError
  }

  const parsed = PinUpdateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return jsonError("고정 상태를 확인해주세요.", 400)
  }

  const ready = requireSupabase()
  if (ready.kind === "missing") {
    return jsonError("Supabase 환경변수가 설정되지 않았습니다.", 503)
  }

  const { id } = await context.params
  const update = await ready.supabase
    .from("bazocon_questions")
    .update({ is_pinned: parsed.data.isPinned })
    .eq("id", id)

  if (update.error !== null) {
    return jsonError("질문 고정 변경에 실패했습니다.", 500)
  }

  await ready.supabase.from("bazocon_admin_actions").insert({
    question_id: id,
    action: parsed.data.isPinned ? "pin" : "unpin",
    after_state: { is_pinned: parsed.data.isPinned },
  })

  if (!(await touchEventState(ready.supabase))) {
    return jsonError("질문은 변경됐지만 실시간 갱신에 실패했습니다.", 500)
  }

  return jsonOk({ ok: true })
}
