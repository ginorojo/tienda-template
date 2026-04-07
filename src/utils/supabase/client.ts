import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ ERROR: Supabase keys are missing in Runtime Environment Variables!");
    console.error("URL:", !!supabaseUrl, "Key:", !!supabaseAnonKey);
    return {} as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
