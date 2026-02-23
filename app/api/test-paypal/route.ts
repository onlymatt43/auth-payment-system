import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

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

    return NextResponse.json({
      success: true,
      mode: process.env.PAYPAL_MODE,
      api_base: PAYPAL_API_BASE,
      token_received: !!response.data.access_token,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      mode: process.env.PAYPAL_MODE,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
  }
}
