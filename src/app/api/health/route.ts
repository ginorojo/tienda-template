import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Endpoint de Auditoría para Cloudflare Pages
 * Verifica la disponibilidad de variables de entorno y la conexión real a Supabase.
 */
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NODE_ENV: process.env.NODE_ENV,
      CF_PAGES: !!process.env.CF_PAGES,
      RUNTIME: typeof (globalThis as any).EdgeRuntime !== 'undefined' ? 'edge' : 'nodejs',
    },
    database: {
      status: 'PENDING',
      message: '',
    }
  };

  try {
    const supabase = await createClient();
    
    // Test simple: Intentar una consulta mínima
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (error) {
      diagnostics.database.status = 'ERROR';
      diagnostics.database.message = error.message;
    } else {
      diagnostics.database.status = 'OK';
      diagnostics.database.message = 'Conexión exitosa a Supabase.';
    }
  } catch (err: any) {
    diagnostics.database.status = 'CRASH';
    diagnostics.database.message = err.message || 'Error desconocido al inicializar cliente.';
  }

  return NextResponse.json(diagnostics);
}
