import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Obtener variables de entorno dentro de la función para asegurar visibilidad en Edge
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 2. Respuesta base
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  // 3. Inicializar el cliente usando el patrón de headers inmutables
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 4. IMPORTANTE: Usar try-catch para evitar que un error de auth mate al middleware
  try {
    await supabase.auth.getUser()
  } catch (e) {
    console.error("❌ Auth middleware error:", e);
  }

  return supabaseResponse
}
