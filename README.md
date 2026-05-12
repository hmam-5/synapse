# Synapse Enterprise SaaS

Synapse is a production-grade, multi-tenant enterprise collaboration and project management platform. Inspired by the performance of Linear and the flexibility of Notion, it is built with a focus on security, scalability, and AI-driven productivity.

## 🚀 Core Features

- **Multi-Tenant Architecture:** Seamlessly manage multiple organizations, teams, and projects.
- **AI-Powered Sprint Planning:** Streamlined task analysis and sprint suggestions using Vercel AI SDK.
- **Real-time Collaboration:** Live notifications, task updates, and member activities via Supabase Realtime.
- **Kanban Board:** High-performance, optimistic drag-and-drop task management.
- **Advanced Security (RBAC/RLS):** Role-Based Access Control integrated into the database level via custom JWT claims.
- **Compliance Audit Logging:** Immutable record of all critical organization actions.
- **Self-Hosted Infrastructure:** Production-ready Docker & Nginx configuration.

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion.
- **Backend:** Supabase (PostgreSQL), Supabase Auth, Supabase Realtime.
- **Infrastructure:** Docker, Nginx, GitHub Actions (CI/CD).
- **Testing:** Vitest, Playwright (90%+ Target Coverage).
- **AI:** OpenAI GPT-4-Turbo / Gemini integration.

## 🏁 Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- A Supabase Project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/synapse.git
   cd synapse/web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🐳 Deployment

The project is designed for self-hosting on a VPS (AWS, DigitalOcean, etc.).

1. **Build Docker Image:**
   ```bash
   docker build -t synapse-app .
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

## 🧪 Testing

- **Unit/Integration:** `npm run test`
- **End-to-End:** `npm run test:e2e`
- **Coverage:** `npm run test:coverage`

## 📄 License

Proprietary. All rights reserved.
