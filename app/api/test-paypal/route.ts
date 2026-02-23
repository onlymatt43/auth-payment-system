import { NextResponse } from 'next/server';
import axios from 'axios';

async function testPayPalAuth(mode: 'live' | 'sandbox') {
  const apiBase = mode === 'live' 
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post(
      `${apiBase}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      success: true,
      mode,
      token_received: true,
    };
  } catch (error: any) {
    return {
      success: false,
      mode,
      error: error.response?.data?.error || error.message,
      error_description: error.response?.data?.error_description,
    };
  }
}

export async function GET() {
  const configuredMode = process.env.PAYPAL_MODE || 'sandbox';
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';

  // Détection du type de credentials basé sur le format du Client ID
  const credentialType = clientId.startsWith('A') && clientId.length > 70 
    ? 'likely_sandbox' 
    : clientId.length > 70 
    ? 'likely_live' 
    : 'unknown';

  // Tester les deux modes
  const liveTest = await testPayPalAuth('live');
  const sandboxTest = await testPayPalAuth('sandbox');

  // Diagnostic
  let diagnosis = '';
  let recommendation = '';

  if (configuredMode === 'live' && !liveTest.success) {
    if (sandboxTest.success) {
      diagnosis = '❌ Configured for LIVE but using SANDBOX credentials';
      recommendation = 'Change PAYPAL_MODE to "sandbox" OR update credentials to Live credentials from PayPal Dashboard';
    } else {
      diagnosis = '❌ Live credentials invalid';
      recommendation = 'Verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in PayPal Dashboard → Live section';
    }
  } else if (configuredMode === 'sandbox' && !sandboxTest.success) {
    if (liveTest.success) {
      diagnosis = '❌ Configured for SANDBOX but using LIVE credentials';
      recommendation = 'Change PAYPAL_MODE to "live" OR update credentials to Sandbox credentials';
    } else {
      diagnosis = '❌ Sandbox credentials invalid';
      recommendation = 'Verify credentials in PayPal Dashboard → Sandbox section';
    }
  } else if ((configuredMode === 'live' && liveTest.success) || (configuredMode === 'sandbox' && sandboxTest.success)) {
    diagnosis = '✅ Configuration correct';
    recommendation = `PayPal ${configuredMode} mode works correctly`;
  }

  return NextResponse.json({
    configured_mode: configuredMode,
    credential_type_detected: credentialType,
    client_id_prefix: clientId.substring(0, 10),
    live_auth_test: liveTest,
    sandbox_auth_test: sandboxTest,
    diagnosis,
    recommendation,
  });
}
