# Synapse Technical Architecture

This document provides a deep dive into the architectural decisions and implementation details of the Synapse platform.

## 1. Multi-Tenant Database Design

Synapse uses a **Shared Database, Shared Schema** multi-tenant approach with **Row Level Security (RLS)** to ensure strict data isolation.

### Core Schema Entitites
- `organizations`: The top-level tenant container.
- `users`: Global user accounts.
- `organization_members`: Linking users to orgs with specific `app_role` (RBAC).
- `projects`: Groupings of work within an organization.
- `tasks`: Individual units of work.
- `audit_logs`: Immutable record of actions.

### RBAC Implementation
Role-Based Access Control is enforced at the database level. 
1. **Custom JWT Claims:** A Postgres trigger `update_user_jwt_claims` aggregates a user's organization memberships and roles into the `app_metadata` of their Supabase JWT.
2. **RLS Policies:** Policies use `get_jwt_org_role(org_id)` to verify permissions instantly without joining tables in every query.

## 2. Frontend Patterns

### Server-First Architecture
- **Next.js 15 App Router:** We leverage Server Components for data fetching to reduce client-side bundle size and improve SEO/Performance.
- **Server Actions:** All mutations (creating projects, updating tasks) are handled via Server Actions, providing a clean API boundary and simplified form handling.

### State Management
- **Server State:** Handled by Supabase and Next.js caching.
- **Client State:** Zustand is used for transient UI states (sidebar toggles, command palette open state).
- **Optimistic UI:** React 19 `useTransition` and custom state management are used for high-frequency interactions like Kanban drag-and-drop.

## 3. Security Model

- **Authentication:** Multi-method support (Email/Password, Magic Link) with placeholders for WebAuthn.
- **Middleware:** The `middleware.ts` ensures sessions are refreshed and handles protected route redirects.
- **Data Integrity:** Postgres triggers handle automatic timestamps (`updated_at`) and audit logging.

## 4. AI & Realtime

- **AI Sprint Planner:** Uses Vercel AI SDK to stream suggestions from OpenAI. Input is context-aware based on the user's active tasks.
- **Realtime Notifications:** Leverages Supabase Realtime (CDC) to push notifications to the `NotificationBell` component without polling.

## 5. Testing Strategy

- **Vitest:** Focused on logic verification in server actions and UI component rendering.
- **Playwright:** Covers critical user journeys (Sign up -> Create Org -> Create Project -> Task Drag/Drop).
- **Coverage:** Aiming for 90%+ by testing both happy paths and edge-case error states.
