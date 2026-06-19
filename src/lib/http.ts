import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/security"
import { getServiceSupabase } from "@/lib/supabase/server"

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export function jsonOk<T extends object>(payload: T): NextResponse {
  return NextResponse.json(payload)
}

export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdminAuthenticated()) {
    return null
  }
  return jsonError("관리자 인증이 필요합니다.", 401)
}

export function requireSupabase() {
  const supabase = getServiceSupabase()
  if (supabase === null) {
    return { kind: "missing" } as const
  }
  return { kind: "ready", supabase } as const
}
