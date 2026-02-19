import { NextRequest, NextResponse } from 'next/server';
import { verifySync } from 'otplib';
import client from '../../../lib/turso';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // --- MODE 1: PAYHIP LICENSE VALIDATION ---
    // Si un "code" Payhip est fourni
    if (body.code) {
        if (!process.env.PAYHIP_API_KEY) {
            console.error("PAYHIP_API_KEY manquante");
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        try {
            // Revert to GET to match working legacy implementation
            const payhipRes = await axios.get('https://payhip.com/api/v2/license/verify', {
                params: { license_key: body.code },
                headers: { 
                    'product-secret-key': process.env.PAYHIP_API_KEY,
                    'Accept': 'application/json'
                }
            });

            const license = payhipRes.data.data;
            console.log("Payhip Response:", JSON.stringify(payhipRes.data)); // Debug log

            // Vérification plus souple: on vérifie juste si on a des données de licence
            if (license && license.enabled !== false) {
                return NextResponse.json({ 
                    valid: true, 
                    type: 'payhip',
                    details: {
                        product: license.product_name,
                        email: license.buyer_email
                    }
                });
            } else {
                console.error("Licence invalide:", license);
                return NextResponse.json({ 
                    valid: false, 
                    message: 'Licence invalide ou désactivée',
                    debug: payhipRes.data // Retourner le debug pour le client
                }, { status: 401 });
            }
        } catch (err: any) {
            console.error("Erreur Payhip (Catch):", err.response?.data || err.message);
            return NextResponse.json({ 
                valid: false, 
                message: 'Erreur de vérification Payhip',
                debug: err.response?.data || err.message
            }, { status: 401 });
        }
    }

    // --- MODE 2: OTP / QR CODE (Legacy/Admin) ---
    const { token } = body;
    if (!email || !token) {
      return NextResponse.json({ error: 'Email and token required' }, { status: 400 });
    }

    // Get IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Get secret from DB
    const result = await client.execute({
      sql: 'SELECT secret FROM access_codes WHERE email = ? AND ip = ? ORDER BY created_at DESC LIMIT 1',
      args: [email, ip],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No access found' }, { status: 404 });
    }

    const secret = result.rows[0].secret as string;

    // Verify token using otplib functional API
    const verifyResult = verifySync({ secret, token });
    const isValid = verifyResult.valid;

    if (isValid) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}