# ============================================================
# SYNAPSE: Multi-stage Production Dockerfile
# Optimized for 1GB RAM / 2GB Swap DigitalOcean Droplet
# ============================================================

# Stage 1: Install dependencies only
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all deps (including devDeps needed for build)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time env vars (NEXT_PUBLIC_* are inlined during build)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Critical: Limit Node.js heap for 1GB RAM droplet
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=512"

RUN npm run build

# Stage 3: Minimal production runner (~90MB image)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the standalone output + static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run with conservative memory limits at runtime
CMD ["node", "--max-old-space-size=384", "server.js"]
