import axios from 'axios';

/**
 * Configuration PayPal REST API
 */

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

/**
 * Obtenir un access token PayPal
 */
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

/**
 * Créer une commande PayPal
 */
export async function createPayPalOrder(amount: string, description: string, customId: string) {
  const accessToken = await getAccessToken();

  const response = await axios.post(
    `${PAYPAL_API_BASE}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount,
          },
          description,
          custom_id: customId,
        },
      ],
      application_context: {
        return_url: `${process.env.NEXTAUTH_URL}/api/paypal/capture`,
        cancel_url: `${process.env.NEXTAUTH_URL}/shop?cancelled=true`,
        brand_name: 'OnlyMatt Points',
        user_action: 'PAY_NOW',
      },
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

/**
 * Capturer le paiement PayPal
 */
export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken();

  const response = await axios.post(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}
