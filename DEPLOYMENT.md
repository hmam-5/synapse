# Synapse Deployment Guide

This guide covers how to deploy Synapse to a production VPS using Docker, Nginx, and GitHub Actions.

## 1. Infrastructure Requirements

- **VPS:** Ubuntu 22.04+ (2GB RAM minimum, 4GB recommended).
- **Domain:** A domain name with DNS access.
- **Supabase:** A production Supabase project.

## 2. Server Setup

### Install Docker
```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable --now docker
```

### Configure Nginx
We use Nginx as a reverse proxy with SSL termination.
1. Copy `nginx/synapse.conf` to `/etc/nginx/sites-available/`.
2. Link to `sites-enabled`.
3. Use Certbot for Let's Encrypt SSL:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com
   ```

## 3. Deployment with Docker Compose

1. **Clone the repo** to the server.
2. **Create a `.env` file** in the root with production secrets.
3. **Run Compose:**
   ```bash
   docker-compose up -d --build
   ```

The `docker-compose.yml` includes:
- **`app`**: The Next.js standalone build.
- **`redis`**: For rate limiting and caching.
- **`nginx`**: Handling requests and SSL.

## 4. CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) is configured to:
1. **Lint & Type Check**: Ensure code quality.
2. **Run Tests**: Execute Vitest and Playwright.
3. **Build Docker Image**: Create a production-ready image.
4. **Deploy**: SSH into the VPS and trigger `docker-compose pull && docker-compose up -d`.

### Required GitHub Secrets:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SSH_PRIVATE_KEY`
- `SERVER_IP`
- `DOCKER_HUB_USERNAME`
- `DOCKER_HUB_TOKEN`

## 5. Security Hardening

- **Firewall:** Only ports 80, 443, and 22 should be open.
- **Fail2Ban:** Install to prevent brute-force attacks on SSH.
- **Supabase RLS:** Double-check all tables have RLS enabled and policies are strict.
