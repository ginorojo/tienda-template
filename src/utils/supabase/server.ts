import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ ERROR SERVER: Supabase keys are missing!");
    // Devolvemos un objeto Mock que evita que la app explote al llamar a .from()
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

  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
