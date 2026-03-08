import nodemailer from 'nodemailer';

const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
const smtpSecure = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === 'true'
  : smtpPort === 465;
const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  authMethod: process.env.SMTP_AUTH_METHOD || 'LOGIN',
});

export const sendQREmail = async (to: string, qrCodeHTML: string) => {
  const mailOptions = {
    from: fromAddress,
    to,
    subject: 'Votre code QR pour accéder au contenu',
    html: `
      <p>Bonjour,</p>
      <p>Voici votre code QR pour configurer Google Authenticator et accéder au contenu :</p>
      ${qrCodeHTML}
      <p>Scannez le code avec Google Authenticator.</p>
      <p>Cordialement,</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendLoginCodeEmail = async (to: string, code: string) => {
  const mailOptions = {
    from: fromAddress,
    to,
    subject: 'Votre code de connexion OnlyPoint$',
    html: `
      <p>Bonjour,</p>
      <p>Voici votre code de validation pour accéder à OnlyPoint$ :</p>
      <p style="font-size: 2rem; font-weight: bold; letter-spacing: 0.5rem;">${code}</p>
      <p>Ce code expire dans 10 minutes.</p>
      <p>Merci!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};