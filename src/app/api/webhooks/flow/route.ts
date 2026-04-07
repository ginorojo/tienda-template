import { NextRequest, NextResponse } from 'next/server';
import { verifyFlowSignature } from '@/lib/flow';
import { createClient } from '@/utils/supabase/server';
import { createShipitOrder } from '@/lib/shipping';



/**
 * Flow.cl Webhook - Transfiere el control de pago
 * URL: /api/webhooks/flow
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    // ... rest of the extraction logic ...
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    const token = params.token;
    if (!token) {
        return NextResponse.json({ error: 'Token missing' }, { status: 400 });
    }

    // 1. Obtener estado del pago desde Flow.cl
    const apiKey = process.env.FLOW_API_KEY!;
    const secretKey = process.env.FLOW_SECRET_KEY!;
    const apiUrl = process.env.FLOW_API_URL!;

    // Generar firma para consulta de estado
    const statusParams: Record<string, string> = { apiKey, token };
    const keys = Object.keys(statusParams).sort();
    const baseString = keys.map(k => `${k}=${statusParams[k]}`).join('&');

    // HMAC Sign
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(baseString));
    const s = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const statusResponse = await fetch(`${apiUrl}/payment/getStatus?apiKey=${apiKey}&token=${token}&s=${s}`);
    const paymentData = await statusResponse.json();

    if (!statusResponse.ok) {
        throw new Error('No se pudo verificar el estado del pago en Flow');
    }

    // 2. Transacción Exitosa? (Status: 2 = pagado)
    const supabase = await createClient();
    if (paymentData.status === 2) {
        // A. Actualizar Supabase a Pagado
        const { data: order, error: updateError } = await supabase
            .from('orders')
            .update({ 
                status: 'paid', 
                payment_method: paymentData.paymentData?.media || 'flow' 
            })
            .eq('flow_token', token)
            .select('*')
            .single();

        if (updateError) throw updateError;

        // B. Generar Orden en Shipit
        if (order) {
            try {
                // Obtener items para contar
                const { data: items } = await supabase
                    .from('order_items')
                    .select('*')
                    .eq('order_id', order.id);

                const itemsCount = items?.reduce((acc, item) => acc + item.quantity, 0) || 1;

                const shipitResult = await createShipitOrder({
                    reference: order.flow_order_id,
                    full_name: order.customer_name,
                    email: order.customer_email,
                    cellphone: order.customer_phone,
                    items_count: itemsCount,
                    destiny: {
                        street: order.address,
                        number: "S/N", // Shipit suele separar calle y número, aquí lo simplificamos
                        commune_name: order.comuna
                    },
                    courier_id: order.courier_id,
                    courier_name: order.courier_name
                });

                // C. Guardar tracking en Supabase
                if (shipitResult && shipitResult.id) {
                    await supabase
                        .from('orders')
                        .update({ 
                            shipit_id: shipitResult.id.toString(),
                            tracking_number: shipitResult.tracking_number,
                            shipping_status: 'ready_to_ship'
                        })
                        .eq('id', order.id);
                }
            } catch (shipitErr) {
                console.error('Failed to create Shipit order after payment:', shipitErr);
                // No lanzamos error para que Flow reciba el OK del pago, 
                // pero logueamos el error de Shipit para gestión manual.
            }
        }
    } else {
        // Actualizar a fallido o cancelado
        await supabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('flow_token', token);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Flow Webhook Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
