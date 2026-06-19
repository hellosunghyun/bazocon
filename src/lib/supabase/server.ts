import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { getServerEnv } from "@/lib/env"

let serviceClient: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  return getServerEnv() !== null
}

export function getServiceSupabase(): SupabaseClient | null {
  const env = getServerEnv()
  if (env === null) {
    return null
  }
  if (serviceClient === null) {
    serviceClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  }
  return serviceClient
}
