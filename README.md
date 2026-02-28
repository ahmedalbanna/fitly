# FITLY (فتلي) — Fitness & Measurement Tracking App

A full-stack mobile application for recording, tracking, viewing, and sharing body measurements.

---

## Project Structure

```
fitly/
├── backend/          # Node.js + Express + Prisma + PostgreSQL
└── mobile/           # React Native + Expo + Expo Router + Zustand
```

---

## Backend Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Steps

```bash
cd fitly/backend

# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed conversion tables & sample banner
npm run db:seed

# Start the server
npm run dev     # development (with nodemon)
npm start       # production
```

The API will be available at `http://localhost:3000`.

### Environment Variables (`.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (default: `7d`) |
| `PORT` | Server port (default: `3000`) |
| `SMTP_HOST/PORT/USER/PASS` | Email (Nodemailer) config |
| `EMAIL_FROM` | Sender name/email |
| `OTP_EXPIRES_MINUTES` | OTP validity (default: `15`) |
| `TRIAL_DURATION_HOURS` | Free trial length (default: `24`) |
| `FRONTEND_URL` | Used for password reset links |

> **Dev mode tip:** In non-production, signup and forgot-password responses include `devOtp` and `devResetLink` fields so you can test without email.

---

## Mobile Setup

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator (or Expo Go)

### Steps

```bash
cd fitly/mobile

# Install dependencies
npm install

# Set your backend URL (create .env or use the default localhost:3000)
# EXPO_PUBLIC_API_URL=http://YOUR_IP:3000

# Start the app
npm start
```

Then press `i` for iOS, `a` for Android, or scan the QR code with Expo Go.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Create account, send OTP |
| POST | `/auth/verify-otp` | Verify OTP → get JWT |
| POST | `/auth/resend-otp` | Resend OTP |
| POST | `/auth/login` | Login → get JWT |
| POST | `/auth/forgot-password` | Send reset link |
| POST | `/auth/reset-password` | Reset password with token |
| DELETE | `/auth/account` | Delete account (auth required) |

### Profiles
| Method | Endpoint | Description |
|---|---|---|
| GET | `/profiles` | Get all profiles |
| POST | `/profiles` | Add dependent |
| PUT | `/profiles/:id` | Update profile |
| DELETE | `/profiles/:id` | Delete dependent |

### Measurements
| Method | Endpoint | Description |
|---|---|---|
| GET | `/measurements/:profileId` | All measurements |
| GET | `/measurements/:profileId/latest` | Latest measurement |
| POST | `/measurements/:profileId` | Save measurement |
| PUT | `/measurements/:id` | Update measurement |
| DELETE | `/measurements/:id` | Delete measurement |

### Cards
| Method | Endpoint | Description |
|---|---|---|
| GET | `/cards` | All user cards |
| POST | `/cards/:profileId` | Generate/refresh card |
| DELETE | `/cards/:id` | Delete card |
| GET | `/cards/share/:token` | Public share (no auth) |

### Conversions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/conversions?type=Shirts&system=EU&value=90` | Convert size |
| GET | `/conversions/types` | Available product types |
| GET | `/conversions/systems?type=Shirts` | Available systems |
| GET | `/conversions/sizes?type=Shirts&system=EU` | All sizes |

### Subscriptions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/subscriptions/status` | Current status |
| POST | `/subscriptions/trial/activate` | Activate 24h trial |
| POST | `/subscriptions/subscribe` | Subscribe (MONTHLY/ANNUAL) |
| POST | `/subscriptions/restore` | Restore purchase |

### Banners
| Method | Endpoint | Description |
|---|---|---|
| GET | `/banners` | Active banners for home slider |

---

## User States

| State | Description |
|---|---|
| `GUEST` | Browsing only, no data saving |
| `REGISTERED` | Has account, trial not yet activated |
| `TRIAL_ACTIVE` | 24-hour free trial running |
| `TRIAL_EXPIRED` | Trial ended, data locked |
| `SUBSCRIBER` | Active monthly/annual subscription |

---

## Key Features
- 🔐 Email OTP verification
- 👤 Main profile + unlimited dependents
- 📏 8 body measurements per profile
- 🃏 Auto-generated measurement cards with share token
- 🔄 Size conversion (Shirts/Pants/Shoes/Thobe × EU/US/UK)
- 🧍 Rules-based BMI avatar display
- 💳 Monthly / Annual subscription with trial
- 🎯 Coach marks on first launch
- 🌍 Arabic + English support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo SDK 50 + Expo Router v3 |
| State | Zustand |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + OTP (Nodemailer) |
| Payments | Mock (ready for RevenueCat/Stripe integration) |
