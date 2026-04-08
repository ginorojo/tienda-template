import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ ERROR CLIENT: Supabase keys are missing!");
    return {
      from: () => ({
        select: () => ({
          order: () => ({ data: [], error: { message: "Supabase keys missing" } }),
          limit: () => ({ data: [], error: { message: "Supabase keys missing" } }),
          single: () => ({ data: null, error: { message: "Supabase keys missing" } }),
        }),
      }),
      auth: { getUser: async () => ({ data: { user: null }, error: null }) }
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
