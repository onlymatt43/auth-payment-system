import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendQREmail = async (to: string, qrCodeHTML: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
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