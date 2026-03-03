# resto-monitor-mono

Monorepo for resto-monitor — a restaurant scraping and monitoring platform.

## Apps

| App | Port | Description |
|-----|------|-------------|
| `resto-front` | 3000 | React frontend (Vite + TanStack Router) |
| `resto-api` | 3001 | API server (Bun + oRPC) |
| `resto-scrape-worker` | 3002 | Scrape worker (Bun) |

## Packages

| Package | Description |
|---------|-------------|
| `resto-db` | Shared database schema and migrations (Drizzle ORM) |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh)
- [Docker](https://www.docker.com) with Compose

### 1. Install dependencies

```sh
bun install
```

### 2. Start the database

```sh
docker-compose up -d
```

This starts a PostgreSQL 17 instance on port `54321` with:
- Superuser: `postgres` / `password`
- App user: `app` / `password`
- App database: `app`

### 3. Start all services

```sh
bun run dev
```

This concurrently starts the API, scrape worker, and frontend.

## Environment Variables

Both `apps/resto-api` and `apps/resto-scrape-worker` ship with a `.env` file pre-configured for local development:

```
DATABASE_URL=postgres://app:password@localhost:54321
```
