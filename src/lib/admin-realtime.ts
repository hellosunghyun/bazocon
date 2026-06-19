import type { SupabaseClient } from "@supabase/supabase-js"

export async function touchEventState(supabase: SupabaseClient): Promise<boolean> {
  const result = await supabase
    .from("bazocon_event_state")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", true)

  return result.error === null
}
