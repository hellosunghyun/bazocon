import { jsonError, jsonOk, requireAdmin, requireSupabase } from "@/lib/http"
import { mapEventState } from "@/lib/mappers"
import { EventStateUpdateSchema } from "@/lib/validation"

export async function POST(request: Request) {
  const authError = await requireAdmin()
  if (authError !== null) {
    return authError
  }

  const parsed = EventStateUpdateSchema.safeParse(await request.json())
  if (!parsed.success) {
    return jsonError("현재 세션 상태를 확인해주세요.", 400)
  }

  const ready = requireSupabase()
  if (ready.kind === "missing") {
    return jsonError("Supabase 환경변수가 설정되지 않았습니다.", 503)
  }

  const update = await ready.supabase
    .from("bazocon_event_state")
    .upsert({
      id: true,
      current_session_id: parsed.data.currentSessionId,
      notice: parsed.data.notice ?? null,
      updated_at: new Date().toISOString(),
    })
    .select("current_session_id, notice, updated_at")
    .single()

  if (update.error !== null) {
    return jsonError("현재 세션 변경에 실패했습니다.", 500)
  }
  return jsonOk({ ok: true, eventState: mapEventState(update.data) })
}
