import { getCurrentScreenSnapshot } from "@/lib/data"
import { jsonOk } from "@/lib/http"

export async function GET() {
  return jsonOk(await getCurrentScreenSnapshot())
}
