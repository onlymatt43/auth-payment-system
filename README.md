# OnlyMatt Points - Boutique de Points avec PayPal

Système centralisé d'achat et gestion de points pour accéder aux projets OnlyMatt. Intégration PayPal + Google OAuth + Turso.

## ✨ Features

- **Boutique de points**: Achat de packages via PayPal (50pts=$5, 200pts=$15, 500pts=$30)
- **Google OAuth**: Connexion sécurisée (pas de passwords)
- **Solde global**: Un compte email → un solde utilisable sur tous les projets
- **Consommation flexible**: Chaque projet coûte X points configurables
- **Valeurs modulables**: Ajuster $ et temps par point (promos faciles)
- **Admin interface**: Gérer packages, projets, configuration en temps réel
- **API publique**: project-links et autres projets peuvent consommer les points

## 🏗️ Architecture

### Prerequisites

- Node.js 20.x or higher
- GitHub account
- Vercel or Render account (for deployment)
- Payhip account with API access
- SMTP email service (e.g., Gmail, SendGrid, Mailgun)
- Turso account for database (free tier available at [turso.tech](https://turso.tech))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/onlymatt43/auth-payment-system.git
cd auth-payment-system
```

2. Install dependencies:
```bash
npm install
```
.local` file in the root directory with the required environment variables (see Environment Variables section below).

4. Initialize your Turso database:
```bash
turso db create auth-payment-system
turso db tokens create auth-payment-system
```

5. Run the database setup:
```bash
npm run dev
# In another terminal:
curl -X POST http://localhost:3000/api/setup
```

6. Start developing
4. Run locally:
```bash
npm run dev
```

## API Endpoints

### POST /api/setup
Initializes the database table for access codes.

**Request:**
```bash
curl -X POST https://your-domain.com/api/setup
```

### POST /api/generate-access
Generates a TOTP secret and sends QR code via email (admin/manual access).

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Access sent to email"
}
```

### POST /api/validate
Validates access via two modes:

**Mode 1 - Payhip License Validation:**
```json
{
  "code": "your-payhip-license-key"
}
```

**Response (success):**
```json
{
  "valid": true,
  "type": "payhip",
  "details": {
    "product": "Product Name",
    "email": "buyer@example.com"
  }
}
```

**Mode 2 - TOTP Token Validation:**
```json
{
  "email": "user@example.com",
  "token": "123456"
}
```

**Response (success):**
```json
{
  "valid": true
}
```

### GET /qr?code=[payhip-code]
Displays QR code page after Payhip purchase validation.

---

## Pages

### `/` - Homepage
Main landing page with:
- Email/OTP access request form
- Links to social profiles and payment services
- Payhip validation modal for premium access
.local` file in the root directory (for local development) or add these in your deployment platform
### `/links` - Social Links
Displays your contact and social media links:
- Official website
- Amazon profile
- WhatsApp
- PayPal
- Wise

### `/qr` - QR Code Display
Protected page that validates Payhip code and displays Google Authenticator QR code.

## Environment Variables

Create a `.env` file in the root directory:

```env
# Payhip Configuration
PAYHIP_API_BASE_URL=https://payhip.com/api/v2
PAYHIP_API_KEY=your_payhip_api_key
PAYHIP_PRODUCT_ID=your_product_id
ALLOW_PAYHIP_BYPASS=false

# Database
TURSO_AUTH_TOKEN=your_turso_auth_token
TURSO_DATABASE_URL=your_turso_database_url
ended)
If your Payhip plan supports URL downloads:
- Set download URL to: `https://your-domain.vercel.app
SMTP_PASS=your_smtp_password
SMTP_PORT=465
SMTP_USER=your_smtp_username

# Optional: Render API (for deployment management)
RENDER_SERVICE_ID=your_render_service_id
RENDER_TOKEN=your_render_token
```

## Payhip Integration

### Option 1: URL Download (Recommandé)
If your Payhip plan supports URL downloads:
- Set download URL to: `https://your-render-url.onrender.com/qr?code={license_key}`

### Option 2: HTML File Download
If only file uploads are allowed:
- Download `qr-access.html` from this repository
- Upload it as a digital download in Payhip
- Users download the HTML file, enter their license key, and access the QR code

This provides a seamless experience with minimal extra steps.

## Website Integration

Add a purchase button to your website using the provided `payhip-button.html`:

```html
<a href="https://payhip.com/b/YOUR_PRODUCT_LINK" class="payhip-button" target="_blank">
  🔐 Accéder au Contenu Exclusif
</a>
```

Replace `YOUR_PRODUCT_LINK` with your actual Payhip product link.

## WordPress Integration (Breakdance)

For WordPress sites using Breakdance page builder, use the complete integration code from `wordpress-breakdance-integration.html`:

1. Add a **Code Block** element in Breakdance
2. Paste the entire HTML code
3. Customize the exclusive content section
4. Publish your page

The code includes form validation, error handling, and persistent access sessions.

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to link/create a project
4. Add environment variables in Vercel dashboard or via CLI:
   ```bash
   vercel env add TURSO_DATABASE_URL
   vercel env add TURSO_AUTH_TOKEN
   vercel env add PAYHIP_API_KEY
   # ... add all required env vars
   ```
5. Deploy: `vercel --prod`

Alternatively, deploy via GitHub integration:
1. Import repository on [vercel.com](https://vercel.com)
2. Add environment variables in Project Settings
3. Deploy automatically on git push

### Render (Alternative)

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure settings:
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. Add environment variables in the Environment section
5. Deploy

### Local Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

**Note:** Environment variables are required for full functionality. See `.env.example` (create one based on the template below).

## Usage Flow

1. **Purchase on Payhip**: User buys your product and receives a license key
2. **Dirpage.tsx              # Homepage with access forms
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── api/
│   │   ├── generate-access/route.ts  # Email QR delivery
│   │   ├── validate/route.ts         # Payhip + TOTP validation
│   │   └── setup/route.ts            # Database initialization
│   ├── links/
│   │   └── page.tsx          # Social links page
│   └── qr/
│       └── page.tsx          # QR code display after purchase
├── lib/
│   ├── turso.ts              # Database client (lazy init)
│   ├── payhip.ts             # Payhip API integration
│   └── email.ts              # SMTP email service
├── package.json
├── next.config.ts            # Next.js configuration
├── tsconfig.json
auth-payment-system/
├── app/
│   ├── api/
│   │   ├── generate-access/route.ts
│   │   ├── validate/route.ts
│   │   └── se.1.6**: React framework with App Router and Turbopack
- **TypeScript 5**: Type-safe JavaScript
- **Turso (libSQL)**: Distributed SQLite database with edge deployment
- **IP address binding** for access codes (prevents sharing)
- **Time-based one-time passwords** (TOTP) via Google Authenticator
- **Payhip license validation** for purchase verification
- **Secure SMTP email delivery** for QR codes
- **Environment variable configuration** (never commit secrets)
- **TypeScript** for compile-time type safety
- **Lazy database initialization** (prevents build-time errors)

## Known Issues & Solutions

### Build Errors
- **Problem**: `URL_INVALID: The URL 'undefined' is not in a valid format`
- **Solution**: Environment variables are loaded at runtime, not build time. This is expected and won't affect production.

### Next.js 15+ Breaking Changes
- **searchParams** is now a Promise in async Server Components
- All dynamic APIs must be awaited: `const params = await searchParams`

## Troubleshooting

**Q: APIs return 500 errors locally**  
A: Ensure all environment variables are set in `.env.local`

**Q: Payhip validation fails**  
A: Verify `PAYHIP_API_KEY` is correct and the license key is active

**Q: Email not sending**  
A: Check SMTP credentials and ensure port 465 is not blocked by your firewall

**Q: Build warnings about workspace root**  
A: This is normal in monorepo setups. The build will still succeed.-first CSS framework
├── next.config.ts
└── README.md
```

## Technologies Used

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Turso (libSQL)**: Distributed SQLite database
- **Nodemailer**: Email sending via SMTP
- **OTPLib**: TOTP generation and validation
- **QRCode**: QR code generation
- **Axios**: HTTP client for API calls

## Security Features

- IP address binding for access codes
- Time-based one-time passwords (TOTP)
- Secure SMTP email delivery
- Environment variable configuration
- TypeScript for runtime safety

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions, please open an issue on GitHub or contact the maintainer.
