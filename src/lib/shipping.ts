/**
 * Shipit.cl Service (Chile) - Edge Runtime Compatible
 * Documentation: https://developers.shipit.cl/v1.0/reference
 */

export interface ShipitQuoteParams {
  commune_id?: number;
  commune_name: string;
  items: Array<{
    amount: number;
    weight: number;
    length: number;
    width: number;
    height: number;
  }>;
}

export async function getShipitQuote(params: ShipitQuoteParams) {
  const email = process.env.SHIPIT_EMAIL;
  const token = process.env.SHIPIT_TOKEN;
  const originCommune = process.env.SHIPIT_ORIGIN_COMMUNE_NAME || "La Serena";
  
  if (!email || !token) {
    console.error('Shipit configuration missing:', { hasEmail: !!email, hasToken: !!token });
    throw new Error('Configuración de Shipit incompleta (EMAIL o TOKEN)');
  }

  console.log('Fetching Shipit Rates for:', { email, originCommune, to: params.commune_name });

  const payload = {
    package: {
      items: params.items.map(item => ({
        ...item,
        weight: Number(item.weight) || 1,
        length: Number(item.length) || 10,
        width: Number(item.width) || 10,
        height: Number(item.height) || 10,
      }))
    },
    commune_name: params.commune_name,
    seller: {
        commune_name: originCommune
    }
  };

  const response = await fetch('https://api.shipit.cl/v/rates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.shipit.v2', // v2 es más estándar para rates
      'X-Shipit-Email': email,
      'X-Shipit-Token': token,
      'X-Shipit-Access-Token': token, // Alias común
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Shipit API Error Response:', errorText);
    throw new Error(`Shipit API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Retornamos el listado completo de couriers para que el cliente elija
  return data.prices as Array<{
    id: number;
    name: string;
    original_price: number;
    total: number;
    days: number;
  }>;
}

export async function createShipitOrder(orderData: {
    reference: string;
    full_name: string;
    email: string;
    items_count: number;
    cellphone: string;
    destiny: {
        street: string;
        number: string;
        complement?: string;
        commune_id?: number;
        commune_name: string;
    };
    courier_id: number;
    courier_name: string;
}) {
    const email = process.env.SHIPIT_EMAIL!;
    const token = process.env.SHIPIT_TOKEN!;
    const originCommune = process.env.SHIPIT_ORIGIN_COMMUNE_NAME || "La Serena";

    const payload = {
        order: {
            reference: orderData.reference,
            full_name: orderData.full_name,
            email: orderData.email,
            items_count: orderData.items_count,
            cellphone: orderData.cellphone || "999999999",
            shipping_type: "home_delivery",
            destiny: {
                ...orderData.destiny,
                kind: "home_delivery"
            },
            courier: {
                id: orderData.courier_id,
                name: orderData.courier_name
            },
            seller: {
                commune_name: originCommune
            }
        }
    };

    const response = await fetch('https://api.shipit.cl/v/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.shipit.v4',
            'X-Shipit-Email': email,
            'X-Shipit-Token': token,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Shipit Create Order Error:', errorData);
        throw new Error('Error al generar la orden en Shipit');
    }

    return await response.json();
}
