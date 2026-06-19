"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { getPublicEnv } from "@/lib/env"

let browserClient: SupabaseClient | null = null

export function getBrowserSupabase(): SupabaseClient | null {
  const env = getPublicEnv()
  if (env === null) {
    return null
  }
  if (browserClient === null) {
    browserClient = createClient(env.supabaseUrl, env.supabasePublishableKey)
  }
  return browserClient
}
