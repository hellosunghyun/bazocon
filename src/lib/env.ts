export type PublicEnv = {
  readonly supabaseUrl: string
  readonly supabasePublishableKey: string
}

export type ServerEnv = PublicEnv & {
  readonly supabaseServiceRoleKey: string
}

export function getPublicEnv(): PublicEnv | null {
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]
  const supabasePublishableKey = process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]
  if (!supabaseUrl || !supabasePublishableKey) {
    return null
  }
  return { supabaseUrl, supabasePublishableKey }
}

export function getServerEnv(): ServerEnv | null {
  const publicEnv = getPublicEnv()
  const supabaseServiceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]
  if (publicEnv === null || !supabaseServiceRoleKey) {
    return null
  }
  return { ...publicEnv, supabaseServiceRoleKey }
}

export function getAdminPassword(): string | null {
  return process.env["ADMIN_PASSWORD"] ?? null
}
