import { NextRequest, NextResponse } from 'next/server';
import { getShipitQuote } from '@/lib/shipping';



/**
 * Cotizar Envío con Shipit
 * URL: /api/shipping/quote
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { commune_name, items } = body;

    console.log('Shipping Quote Request:', { commune_name, items });

    if (!commune_name || !items) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const quotes = await getShipitQuote({
      commune_name,
      items
    });

    console.log('Shipit Quotes Received:', quotes);

    return NextResponse.json({ 
        quotes 
    });
  } catch (err: any) {
    console.error('Shipit Quote API Error:', err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
