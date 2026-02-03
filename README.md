# Auth Payment System

A modular authentication and payment system integrating Payhip for exclusive content access using QR code-based TOTP (Time-based One-Time Password) authentication.

## Features

- **Payhip Integration**: Validates license keys for product access
- **TOTP Authentication**: Secure QR code generation for Google Authenticator
- **Email Delivery**: SMTP-based QR code delivery
- **Database Storage**: Turso (libSQL) for storing access codes with IP binding
- **Next.js API**: Serverless API routes for seamless integration
- **TypeScript**: Full type safety

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- GitHub account
- Render account (for deployment)
- Payhip account with API access
- SMTP email service

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

3. Create a `.env` file with the required environment variables (see Environment Variables section).

4. Run locally:
```bash
npm run dev
```

## API Endpoints

### POST /api/setup
Initializes the database table for access codes.

**Request:**
```bash
curl -X POST https://your-render-url.onrender.com/api/setup
```

### POST /api/generate-access
Generates a TOTP secret, validates Payhip code, and sends QR code via email.

**Request:**
```json
{
  "email": "user@example.com",
  "payhipCode": "your-payhip-license-key"
}
```

**Response:**
```json
{
  "success": true,
  "message": "QR code sent to your email"
}
```

### POST /api/validate
Validates a TOTP token against stored secrets.

**Request:**
```json
{
  "email": "user@example.com",
  "token": "123456"
}
```

**Response:**
```json
{
  "valid": true,
  "accessGranted": true
}
```

### GET /qr?code=[payhip-code]
Displays QR code page after Payhip purchase validation.

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

# Email (SMTP)
SMTP_HOST=your_smtp_host
SMTP_PASS=your_smtp_password
SMTP_PORT=465
SMTP_USER=your_smtp_username

# Optional: Render API (for deployment management)
RENDER_SERVICE_ID=your_render_service_id
RENDER_TOKEN=your_render_token
```

## Deployment

### Render (Recommended)

1. Create a new **Web Service** on Render
2. Connect your GitHub repository: `https://github.com/onlymatt43/auth-payment-system`
3. Configure settings:
   - **Branch**: `master`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. Add environment variables in the Environment section
5. Deploy

### Local Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage Flow

1. **Purchase on Payhip**: User buys your product and receives a license key
2. **Generate Access**: Call `/api/generate-access` with email and Payhip code
3. **QR Code Delivery**: User receives QR code via email
4. **Setup Authenticator**: User scans QR with Google Authenticator
5. **Access Content**: Use `/api/validate` to verify TOTP tokens for content access

## Project Structure

```
auth-payment-system/
├── app/
│   ├── api/
│   │   ├── generate-access/route.ts
│   │   ├── validate/route.ts
│   │   └── setup/route.ts
│   └── qr/page.tsx
├── lib/
│   ├── turso.ts          # Database client
│   ├── payhip.ts         # Payhip API integration
│   └── email.ts          # SMTP email service
├── package.json
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
