# ResolveDesk Backend

ResolveDesk's Express and MongoDB API for support ticket creation, filtering, status history, and dashboard statistics.

## Requirements

- Node.js 20.19 or later, or 22.12 or later
- npm 9 or later
- MongoDB Community Server or MongoDB Atlas

## Setup

From this directory, install dependencies and create the local environment file:

```powershell
npm install
Copy-Item .env.example .env
```

Replace the placeholders in `.env` with a valid MongoDB connection string and port. `MONGODB_URI` is required. If the URI does not specify a database name, the API uses `support_ticket_tracker`.

If your network cannot resolve MongoDB Atlas SRV records, set `MONGODB_DNS_SERVERS` in `.env` to a trusted comma-separated DNS resolver list.

## Run

```bash
npm run dev
```

The API listens on port `5000` by default. Check `http://localhost:5000/api/health` for service/database status.

## Seed sample data

```bash
npm run seed
```

The seed command inserts 15 sample tickets only when the configured database has no tickets. It refuses to overwrite existing tickets unless `SEED_CLEAR_EXISTING=true` is explicitly set for the run.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API and database health |
| GET | `/api/tickets` | List, search, filter, sort, and paginate tickets |
| POST | `/api/tickets` | Create a ticket |
| GET | `/api/tickets/:id` | Get a ticket and status history |
| PATCH | `/api/tickets/:id` | Update ticket details |
| PATCH | `/api/tickets/:id/status` | Change status and record history |
| DELETE | `/api/tickets/:id` | Delete a ticket |
| GET | `/api/dashboard/stats` | Ticket counts and dashboard data |

Allowed statuses are `Open`, `In Progress`, and `Resolved`. Categories are `Technical`, `Billing`, `Account`, `General`, and `Other`; priorities are `Low`, `Medium`, `High`, and `Urgent`.

## Tests

```bash
npm test
```

Backend tests require MongoDB running locally and use the `resolvedesk_test` database.

Keep `.env` out of Git; only the placeholder `.env.example` belongs in the repository.
