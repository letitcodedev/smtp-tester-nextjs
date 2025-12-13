# SMTP Connection Tester

A web application for testing SMTP server configurations, verifying credentials, and sending test emails. Built with Next.js and React.

## Features

- **Connection Testing** - Verify connectivity to SMTP servers with configurable timeouts
- **Authentication Verification** - Validate SMTP credentials
- **Test Email Sending** - Send styled HTML test emails to verify end-to-end configuration
- **Security Options** - Support for STARTTLS (port 587), SSL/TLS (port 465), and unencrypted (port 25) connections
- **Form Persistence** - Saves configuration (except passwords) to localStorage between sessions
- **Quick Reference** - Built-in configuration cards for Gmail, Outlook, Yahoo, and SendGrid
- **Dark Mode** - Full dark mode support

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe code
- **Tailwind CSS 4** - Styling
- **Nodemailer 7** - SMTP client

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd smtp-tester-nextjs

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
pnpm build
pnpm start
```

## Usage

1. Enter your SMTP server details (host, port)
2. Select security type - port adjusts automatically
3. Enter credentials (username and password)
4. Optionally add sender details and test recipient email
5. Click "Test SMTP Connection"

Results display connection status, authentication status, and email delivery status with detailed error messages if any step fails.

## Project Structure

```
src/
├── app/
│   ├── api/smtp-test/route.ts   # SMTP testing API endpoint
│   ├── layout.tsx               # Root layout with fonts
│   ├── page.tsx                 # Home page with info cards
│   └── globals.css              # Global styles
└── components/
    └── SMTPTestForm.tsx         # Main form component
```

## Security

- Credentials are used only during testing and never stored on the server
- Passwords are never persisted to localStorage
- Connections close immediately after testing
- 10-second timeout protection on all operations

## License

MIT
