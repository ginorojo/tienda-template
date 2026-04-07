/**
 * Flow.cl Service (Chile) - Edge Runtime Compatible
 * Documentation: https://www.flow.cl/api
 */

export interface FlowPaymentParams {
  commerceOrder: string;
  subject: string;
  currency?: string;
  amount: number;
  email: string;
  urlConfirmation: string;
  urlReturn: string;
}

export async function createFlowPayment(params: FlowPaymentParams) {
  const apiKey = process.env.FLOW_API_KEY!;
  const secretKey = process.env.FLOW_SECRET_KEY!;
  const apiUrl = process.env.FLOW_API_URL!;

  const allParams: Record<string, string> = {
    apiKey,
    ...params as any,
    currency: params.currency || 'CLP',
  };

  // 1. Sort parameters alphabetically
  const keys = Object.keys(allParams).sort();
  const baseString = keys.map(k => `${k}=${allParams[k]}`).join('&');

  // 2. HMAC-SHA256 Signature using SubtleCrypto (Edge)
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(baseString);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const s = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // 3. Create Form Data for the request
  const formData = new URLSearchParams();
  keys.forEach(k => formData.append(k, String(allParams[k])));
  formData.append('s', s);

  const response = await fetch(`${apiUrl}/payment/create`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Flow API Error: ${errorText}`);
  }

  return await response.json() as { url: string, token: string, flowOrder: number };
}

/**
 * Validar el Webhook de Flow.cl
 */
export async function verifyFlowSignature(params: Record<string, string>, signature: string) {
  const secretKey = process.env.FLOW_SECRET_KEY!;
  const keys = Object.keys(params).filter(k => k !== 's').sort();
  const baseString = keys.map(k => `${k}=${params[k]}`).join('&');

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(baseString);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const calculatedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return calculatedSignature === signature;
}
