import { createHash, randomUUID, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getAdminPassword } from "@/lib/env"

const ADMIN_COOKIE = "bazocon_admin"

export function hashVisitorId(visitorId: string): string {
  return createHash("sha256").update(visitorId).digest("hex")
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  const password = getAdminPassword()
  if (!token || !password) {
    return false
  }
  return token === adminToken(password)
}

export function makeAdminLoginResponse(password: string): NextResponse {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, adminToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
  })
  return response
}

export function makeAdminLogoutResponse(): NextResponse {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(ADMIN_COOKIE)
  return response
}

export function verifyAdminPassword(input: string): boolean {
  const expected = getAdminPassword()
  if (!expected) {
    return false
  }
  const left = Buffer.from(input)
  const right = Buffer.from(expected)
  if (left.length !== right.length) {
    return false
  }
  return timingSafeEqual(left, right)
}

export function newVisitorId(): string {
  return randomUUID()
}

function adminToken(password: string): string {
  return createHash("sha256").update(`bazocon:${password}`).digest("hex")
}
