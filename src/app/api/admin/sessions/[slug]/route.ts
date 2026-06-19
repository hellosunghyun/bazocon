import { getSessionSnapshot } from "@/lib/data"
import { jsonError, jsonOk, requireAdmin } from "@/lib/http"

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const authError = await requireAdmin()
  if (authError !== null) {
    return authError
  }
  const { slug } = await context.params
  const snapshot = await getSessionSnapshot(slug, null, true)
  if (snapshot === null) {
    return jsonError("세션을 찾을 수 없습니다.", 404)
  }
  return jsonOk(snapshot)
}
