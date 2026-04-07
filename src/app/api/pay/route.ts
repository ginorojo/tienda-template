import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createFlowPayment } from '@/lib/flow';
import { nanoid } from 'nanoid';



/**
 * Iniciar Pago con Flow y Guardar Orden en Supabase
 * URL: /api/pay
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { 
        name, 
        email, 
        phone,
        address, 
        region, 
        comuna, 
        total, 
        shipping_cost,
        courier_id,
        courier_name,
        items 
    } = body;

    // 1. Crear ID único de orden (Chilean Standard)
    const commerceOrder = `ORDER-${nanoid(6).toUpperCase()}`;

    // 2. Crear Orden en Supabase (Pendiente)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          flow_order_id: commerceOrder,
          status: 'pending',
          total,
          shipping_cost,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          region,
          comuna,
          address,
          courier_id,
          courier_name
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Crear Ítems de la orden
    const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        product_name: item.name
    }));

    await supabase.from('order_items').insert(orderItems);

    // 4. Llamar a Flow.cl
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.nextUrl.host}`;
    
    const flowPayment = await createFlowPayment({
        commerceOrder,
        subject: `Compra en Tienda - ${commerceOrder}`,
        amount: total,
        email: email,
        urlConfirmation: `${baseUrl}/api/webhooks/flow`,
        urlReturn: `${baseUrl}/checkout/success?orderId=${order.id}`
    });

    // 5. Actualizar la orden con el token de Flow
    await supabase
        .from('orders')
        .update({ flow_token: flowPayment.token })
        .eq('id', order.id);

    return NextResponse.json({ url: `${flowPayment.url}?token=${flowPayment.token}` });
    
  } catch (err: any) {
    console.error('Payment Initialization Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
