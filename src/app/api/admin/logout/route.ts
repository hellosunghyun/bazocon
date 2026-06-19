import { makeAdminLogoutResponse } from "@/lib/security"

export async function POST() {
  return makeAdminLogoutResponse()
}
