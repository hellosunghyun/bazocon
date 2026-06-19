import { jsonError } from "@/lib/http"
import { makeAdminLoginResponse, verifyAdminPassword } from "@/lib/security"
import { z } from "zod"

const LoginSchema = z.object({
  password: z.string().min(1),
})

export async function POST(request: Request) {
  const parsed = LoginSchema.safeParse(await request.json())
  if (!parsed.success || !verifyAdminPassword(parsed.data.password)) {
    return jsonError("관리자 비밀번호가 올바르지 않습니다.", 401)
  }
  return makeAdminLoginResponse(parsed.data.password)
}
