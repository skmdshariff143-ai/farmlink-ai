# 🌾 FarmLink AI — Smart Agriculture Marketplace

[![Live Demo](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge&logo=vercel)](https://farmlink-umber.vercel.app)
[![Ecosystem Status](https://img.shields.io/badge/Status-SaaS%20Ready-blue?style=for-the-badge)](https://github.com/skmdshariff143-ai/farmlink-ai)

FarmLink AI is a complete, multi-tenant agriculture trading SaaS connecting **Farmers, Buyers, Carriers, and Warehouse providers** with real-time price negotiations, double-entry escrow wallets, and machine learning crop intelligence.

---

## 🚀 Live Demo

Investors and developers can instantly access the live production environment using the link below:

👉 **[Open Live Website](https://farmlink-umber.vercel.app)** 👈  
*(Alternative Alias: [https://farmlink-ai.vercel.app](https://farmlink-ai.vercel.app))*

* **Interactive Investor Pitch Portal**: [https://farmlink-umber.vercel.app/demo](https://farmlink-umber.vercel.app/demo)
  *Features a live bidding ticker, simulated transaction activity streams, and dynamic AI price forecaster parameters.*

---

## 🌟 Core System Modules

### 1. Next.js 15 App Router Web
* Responsive panels for Farmers, Buyers, Logistics, and Administrators.
* Authenticated sessions backed by NextAuth JWTs and bcryptjs hashing.

### 2. React Native (Expo) Mobile App
* Located under `/mobile-app`.
* Uses `expo-camera` to capture leaf images for pathology scans.
* Implements Zustand state caching with offline action queues.

### 3. Socket.IO Real-Time Engine
* Decoupled WebSocket microservice ([`socket-server.js`](socket-server.js)) managing chatrooms, active users status, and bid ticks.

### 4. AI Advisory Services
* Integrates Gemini models for pricing projections and crop health diagnostic suggestions.

### 5. Double-Entry Escrow Payments
* Razorpay & Stripe webhooks verify transaction signatures before releasing buyer locks.

---

## 🛠 Quick Start Guide

### 1. Web Application Setup
```bash
# Clone the repository and install dependencies
npm install

# Build the client libraries and database models
npx prisma generate
npx prisma db push

# Start the Next.js development server
npm run dev
```

### 2. Standalone Real-Time Socket Server
```bash
# Launch the Socket.IO handler on port 3001
node socket-server.js
```

### 3. React Native Mobile App
```bash
cd mobile-app
npm install
npx expo start
```

---

## 📋 Environment Configurations (`.env.local`)
Create a local `.env.local` config using our [`.env.example`](.example.example) template:
* `DATABASE_URL`: Connection URL pointing to Supabase PostgreSQL.
* `NEXTAUTH_SECRET`: Secret key for JWT hashing.
* `GEMINI_API_KEY`: Google Studio API keys.
* `RAZORPAY_KEY_ID` & `RAZORPAY_SECRET`: Fintech gateway credentials.
