import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Dipakai di server (API routes, admin pages) — pakai service role key,
// JANGAN pernah di-import di komponen client ("use client").
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
