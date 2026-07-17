# 🌾 FarmLink AI — Smart Agriculture Marketplace

> **AI-powered Agriculture Marketplace connecting Farmers, Buyers, Transport & Warehouses.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge&logo=vercel)](https://farmlink-umber.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repo-blue?style=for-the-badge&logo=github)](https://github.com/skmdshariff143-ai/farmlink-ai)

---

## 🚀 Live Demo

Investors and developers can instantly access the live production environment using the link below:

👉 **[🚀 Open Live Website](https://farmlink-ai.vercel.app)** 👈  
*(Main server URL: [https://farmlink-umber.vercel.app](https://farmlink-umber.vercel.app))*

---

## 🌋 The Problem

* **Middlemen Exploitation**: Traditional supply chains contain multiple brokers, resulting in farmers receiving less than 35% of the end value of their crops.
* **Price Volatility**: Farmers lack access to real-time mandi prices and forecasts, forcing them to sell under pressure.
* **Logistics Fragmentation**: Storing and transporting agricultural goods lacks centralized tracking, leading to 25% post-harvest spoilage.

---

## 💡 The Solution

FarmLink AI bypasses traditional supply chain layers through a multi-role digital ecosystem:
* **Direct Marketplace**: Connects farmers directly to retail and corporate buyers.
* **AI Mandi Intel**: Employs statistical forecasting models to predict prices.
* **Unified Logistics & Escrow**: Incorporates warehouse storage options and double-entry escrow wallets.

---

## ✨ Features

* **AI Crop Pricing & Demand**: Provides expected pricing indices and volume forecasts.
* **Disease Leaf Scanner**: Grants lens access using `expo-camera` to scan foliage conditions.
* **Real-time mandis**: Supports Socket.IO price bidding updates.
* **Escrow Wallets**: Locks buyer payments in escrow, releasing them to farmers upon dispatch verification.
* **Responsive Portals**: Tailored user dashboards for Farmers, Buyers, Transport, and Warehouses.
* **End-to-End Chat**: Secure typing-alert messaging between market participants.

---

## 💻 Tech Stack

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Zustand, React Query
* **Backend**: Next.js API Routes, Prisma ORM, Supabase PostgreSQL, NextAuth (JWT sessions), Zod validation
* **Realtime**: Socket.IO Standalone Server
* **Mobile**: React Native (Expo SDK 51)
* **AI Layer**: Google Gemini API Integration

---

## 📐 System Architecture

```text
+-----------------------+      Socket.IO (3001)       +-----------------------+
|  React Native App     | <=========================> |  Node Socket Server   |
|  (Expo / Zustand)     |                             |  (Live Bids & Chat)   |
+-----------------------+                             +-----------------------+
           |                                                      ^
           | REST HTTPS                                           | REST HTTPS
           v                                                      v
+-----------------------+      Prisma Client (ORM)    +-----------------------+
|  Next.js 15 Web App   | <=========================> |  Supabase PostgreSQL  |
|  (RSC / NextAuth)     |                             |  (Indexed & Scaled)   |
+-----------------------+                             +-----------------------+
           |
           +---> Google Gemini API (AI pricing & disease diagnostic advice)
           |
           +---> Razorpay / Stripe Gateway (Escrow holds & payments verify)
```

---

## 📸 Screenshots

| Farmer Dashboard Portal | Buyer Mandi Feed | AI Crop Price Predictor |
| :--- | :--- | :--- |
| *[Screenshot Placeholder]* | *[Screenshot Placeholder]* | *[Screenshot Placeholder]* |

---

## 🛠 Installation Guide

### 1. Web Application Setup
```bash
# Clone the repository and install packages
npm install

# Initialize database schemas and client client typings
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### 2. Standalone WebSocket Server
```bash
# Start socket handler on port 3001
node socket-server.js
```

### 3. React Native Mobile App
```bash
cd mobile-app
npm install
npx expo start
```

---

## 📋 Environment Variables (`.env.local`)

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
NEXTAUTH_SECRET="secure-jwt-secret-hash"
NEXT_PUBLIC_APP_URL="https://farmlink-umber.vercel.app"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
GEMINI_API_KEY="AIzaSy...your-key"

# Optional for local development / demo mode; required only for real payment processing:
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_SECRET="razorpay-key-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-event-signature-secret"
DEMO_MODE="true"
```

---

## 💳 Payments Integration & Demo Mode

The payments subsystem defaults to an explicit **Demo Mode** when Razorpay credentials are absent in the environment, displaying a notification banner to let developers verify purchase lifecycles safely.

To enable real production payments:
1. Obtain verified merchant credentials (`RAZORPAY_KEY_ID`, `RAZORPAY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`) from your Razorpay Dashboard.
2. Set the `DEMO_MODE` environment variable to `"false"` in Vercel.
3. Configure the production webhook endpoint `/api/payments/webhook` to listen to standard Razorpay payment events.

---

## 🚀 Cloud Deployment

### 1. Vercel CI/CD
Our repository is configured with Vercel's automated pipeline. Every commit pushed to `main` initiates a build and redeploys the live application.
To deploy manually:
```bash
npm install -g vercel
vercel
```

---

## 🔒 Security Hardening & Concurrency Safety

* **Database Row Locking**: Employs transaction-level PostgreSQL `SELECT ... FOR UPDATE` row locks inside Prisma transactions to block concurrent race conditions during crop listing bidding.
* **Supabase Row Level Security (RLS)**: Enforces database-level access control on all 15 tables (`User`, `CropListing`, `Order`, `Bid`, `ChatMessage`, etc.) mapping roles (FARMER, BUYER, ADMIN) to user identity checks.
* **Socket.IO Authentication & Rate Limiting**: Secures WebSockets using JWT handshake validation matching client cookies, filters message text against HTML Injection/XSS payloads, and blocks spam events using sliding-window rate limit caches.
* **HTTP Security Headers**: Enforces strict `Content-Security-Policy`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, and `X-Content-Type-Options: nosniff` header configurations to mitigate CSRF, Clickjacking, and scripting vulnerabilities.

---

## 🗺 Future Roadmap

- [x] **Phase 1**: Web SaaS Platform Release (Next.js 15)
- [x] **Phase 2**: Real-time Sockets & Bidding (Socket.IO)
- [x] **Phase 3**: React Native Mobile App (Expo Camera)
- [ ] **Phase 4**: On-chain smart contract escrow holds
- [ ] **Phase 5**: Autonomous fleet route optimizations
