# Auth Payment System

A modular authentication and payment system using TOTP, QR codes, email, and database for exclusive access.

## Features

- Generate TOTP secrets and send QR codes via email
- Validate TOTP tokens with IP binding
- Modular for integration with multiple projects
- Built with Next.js, Vercel, Turso, Resend

## Setup

1. Install dependencies: `npm install`
2. Set environment variables: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, RESEND_API_KEY
3. Run setup: POST to /api/setup to create DB table
4. Develop: `npm run dev`

## API Endpoints

- POST /api/generate-access: Generate and email QR code
- POST /api/validate: Validate TOTP token
- POST /api/setup: Setup database

## Usage

Integrate with Payhip or other payment systems to trigger access generation.
