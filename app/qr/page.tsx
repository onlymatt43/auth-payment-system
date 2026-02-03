import { headers } from 'next/headers';
import { validatePayhipCode } from '../../lib/payhip';
const otplib = require('otplib');
import qrcode from 'qrcode';
import client from '../../lib/turso';

export default async function QRPage({ searchParams }: { searchParams: { code?: string } }) {
  const code = searchParams.code;

  if (!code) {
    return (
      <div>
        <h1>Erreur</h1>
        <p>Code manquant.</p>
      </div>
    );
  }

  try {
    // Validate Payhip code
    const payhipData = await validatePayhipCode(code);
    const email = payhipData.email;

    if (!email) {
      throw new Error('Email non trouvé');
    }

    // Get IP
    const ip = 'unknown'; // TODO: get from headers

    // Generate secret
    const secret = otplib.authenticator.generateSecret();

    // Store in DB
    await client.execute('INSERT INTO access_codes (email, secret, ip) VALUES (?, ?, ?)', [email, secret, ip]);

    // Generate QR
    const otpauth = `otpauth://totp/Auth Payment System:${email}?secret=${secret}&issuer=Auth Payment System`;
    const qrCodeDataURL = await qrcode.toDataURL(otpauth);

    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Accès Google Authenticator</h1>
        <p>Scanne ce QR code avec Google Authenticator pour configurer ton accès.</p>
        <img src={qrCodeDataURL} alt="QR Code" />
        <p>Après configuration, utilise les codes générés pour accéder au contenu.</p>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <h1>Erreur</h1>
        <p>{(error as Error).message}</p>
      </div>
    );
  }
}