# Synapse | Enterprise Collaboration Platform

![Synapse Dashboard](./docs/images/dashboard.png)

Synapse is a highly scalable, production-ready enterprise SaaS platform designed for multi-tenant collaboration, task management, and team productivity. It is engineered with security and performance in mind, utilizing a modern, bleeding-edge technology stack.

## 🚀 The Tech Stack

Synapse is built upon a robust architecture designed for high availability and enterprise-grade security.

### Frontend
- **Next.js 16 (App Router)**: Server-side rendering, static site generation, and optimized API routes.
- **React 19**: Utilizing the latest React features and concurrent rendering.
- **Tailwind CSS**: Utility-first CSS framework for a highly polished, responsive, and beautiful UI.
- **Radix UI & Lucide React**: Accessible, unstyled components and crisp vector icons.

### Backend & Database
- **Supabase**: Open-source Firebase alternative serving as the core backend.
- **PostgreSQL**: Robust relational database.
- **Row Level Security (RLS)**: Cryptographically secure database-level access control.
- **Role-Based Access Control (RBAC)**: Custom JWT claims for granular permission handling.

### Integrations
- **Authentication**: Supabase Auth (Email/Password, Magic Links, WebAuthn/Passkeys, and OAuth via GitLab, GitHub, Google).
- **Emails**: **Resend** for transactional emails (invitations, reminders, receipts).
- **Billing**: **Stripe** integration for subscription tiers (Pro, Enterprise).

### Infrastructure & Deployment
- **DigitalOcean**: Hosted on a dedicated Linux VPS droplet.
- **Docker & Docker Compose**: Fully containerized application environments ensuring parity between local and production.
- **Nginx**: High-performance reverse proxy for traffic routing and SSL termination.
- **GitHub Actions**: Automated CI/CD pipeline for deployment.


## 🛠️ Local Development

### 1. Clone the repository
```bash
git clone https://github.com/your-org/synapse.git
cd synapse/web
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and fill in your Supabase, Resend, and Stripe keys.

### 4. Run the development server
```bash
npm run dev
```

---

## 🚢 Production Deployment

Synapse uses Docker Compose for zero-downtime, standalone Next.js deployments.

### On your DigitalOcean VPS:
```bash
# 1. Fetch the latest code
git fetch
git reset --hard origin/main

# 2. Inject Production Secrets
cat << 'EOF' > .env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
STRIPE_SECRET_KEY=...
EOF

# 3. Build and Deploy
docker compose build --no-cache
docker compose up -d --force-recreate
```

## 🧪 Testing
Synapse maintains strict code quality standards, backed by a comprehensive automated testing suite.

- **Unit Testing:** Powered by `Vitest`. Run with `npm run test`.
- **E2E Testing:** Powered by `Playwright`. Run with `npx playwright test`.

---
*Built with ❤️ for Enterprise Productivity.*
