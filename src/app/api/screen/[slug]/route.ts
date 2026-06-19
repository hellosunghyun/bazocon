import { getScreenSnapshot } from "@/lib/data"
import { jsonError, jsonOk } from "@/lib/http"

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const snapshot = await getScreenSnapshot(slug)
  if (snapshot === null) {
    return jsonError("세션을 찾을 수 없습니다.", 404)
  }
  return jsonOk(snapshot)
}
