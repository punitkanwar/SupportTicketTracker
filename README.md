# ResolveDesk — Support Ticket Tracker

A full-stack support ticket management platform built for internal support teams. ResolveDesk provides structured ticket tracking, status workflows, priority management, and analytics to streamline support operations.

> Built as a Full-Stack Developer technical assignment demonstrating modern React, Node.js, and MongoDB practices.

---

## Features

- **Dashboard** — Live stats, activity charts (7, 14, and 30-day views), status/priority/category distribution, recent tickets
- **Ticket Management** — Create, view, update, and delete tickets with full status history
- **Search & Filters** — Debounced search, filter by status/category/priority, server-side pagination
- **Status Workflow** — Open → In Progress → Resolved with full audit trail per ticket
- **Responsive UI** — Desktop sidebar layout with collapsible mobile drawer
- **Dark Design System** — Sophisticated dark theme with consistent tokens and typography

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router DOM |
| State | TanStack Query, React Hook Form, Zod, Axios |
| UI | Lucide React, Sonner toasts, Recharts, Custom components |
| Backend | Node.js, Express.js (ES Modules), Mongoose |
| Database | MongoDB Community Edition (local) |
| Testing | Vitest (frontend), Supertest + Vitest (backend) |

---

## Screenshots

### Dashboard Preview
[Ticket Dashboard]<img width="959" height="440" alt="image" src="https://github.com/user-attachments/assets/79121fe0-c83a-4f37-b3c7-b86eb77a3115" />

### Create & Filter Tickets
[Ticket Filtering]<img width="959" height="437" alt="image" src="https://github.com/user-attachments/assets/568d9d56-01b3-43a4-b0be-9a362c6dd7b5" />

> _Start the app and open http://localhost:5173 to see the application._

---

## Folder Structure

```
resolvedesk/
├── backend/
│   ├── scripts/
│   │   └── seed.js              # Sample data seed script
│   ├── src/
│   │   ├── config/db.js         # MongoDB connection
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Error handling, validation
│   │   ├── models/Ticket.js     # Mongoose schema
│   │   ├── routes/              # Express routers
│   │   ├── utils/ApiError.js    # Custom error class
│   │   ├── app.js               # Express app setup
│   │   └── server.js            # Entry point
│   ├── tests/
│   │   └── ticket.test.js       # Backend API tests
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, AppHeader, AppLayout
│   │   │   └── ui/              # StatusBadge, PriorityBadge, etc.
│   │   ├── hooks/               # useTickets, useDashboard, useDebounce
│   │   ├── lib/                 # utils.js, validation.js
│   │   ├── pages/               # All page components
│   │   ├── services/            # api.js, ticketService.js, dashboardService.js
│   │   ├── test/                # Frontend tests
│   │   ├── App.jsx              # Routes
│   │   └── main.jsx             # App entry with QueryClient & providers
│   ├── .env.example
│   └── package.json
│
├── package.json                 # Root — runs both servers
└── README.md
```

---

## Prerequisites

- **Node.js** v20.19 or later, or v22.12 or later (required by Vite 8)
- **npm** v9 or later
- **MongoDB deployment** — local MongoDB Community Server or MongoDB Atlas

### Installing MongoDB Community Server

1. Visit: https://www.mongodb.com/try/download/community
2. Select your OS, download the installer, and run it.
3. During installation, choose "Install MongoDB as a Service" so it starts automatically.
4. After installation, MongoDB runs on `mongodb://127.0.0.1:27017` by default.
5. Verify: open a terminal and run `mongod --version`

> On Windows, MongoDB service is usually named "MongoDB". You can start/stop it from Services or with:
> ```
> net start MongoDB
> net stop MongoDB
> ```

---

## Setup

### 1. Configure the backend

From the project root in PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
```

Edit `backend\.env` and replace all placeholders. For the default local MongoDB installation, use:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/support_ticket_tracker
NODE_ENV=development
```

`MONGODB_URI` is required; the backend does not silently fall back to a local database. When the URI has no database name, ResolveDesk uses `support_ticket_tracker`.
If your network cannot resolve MongoDB Atlas SRV records, you can optionally set `MONGODB_DNS_SERVERS` to a trusted comma-separated DNS resolver list.

### 2. Configure the frontend

```powershell
Copy-Item frontend\.env.example frontend\.env
```

Set `VITE_API_URL` in `frontend\.env` to the backend API URL:

```
VITE_API_URL=http://localhost:5000/api
```

The `.env.example` templates contain placeholders only. The `.env` files created from them are ignored by Git; never commit credentials or production secrets.

### 3. Install dependencies

From the project root:

```bash
npm run install:all
```

Alternatively, install packages from each directory:

```bash
npm install --prefix backend
npm install --prefix frontend
```

---

## Running the Application

### Option A — Run both together (from root)

```bash
npm run dev
```

### Option B — Run separately

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

| URL | Description |
|---|---|
| http://localhost:5173 | Frontend application |
| http://localhost:5000 | Backend API server |
| http://localhost:5000/api/health | API health check |

---

## Seed Sample Data

Inserts 15 sample tickets with mixed statuses, priorities, categories, and status history. By default, seeding refuses to run when tickets already exist. To explicitly clear and replace them, set `SEED_CLEAR_EXISTING=true` for that run; this deletes every ticket in the configured database.

```bash
cd backend
npm run seed
```

---

## API Endpoints

### Tickets

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tickets` | List tickets (search, filter, paginate, sort) |
| POST | `/api/tickets` | Create a ticket |
| GET | `/api/tickets/:id` | Get ticket by ID |
| PATCH | `/api/tickets/:id` | Update ticket fields |
| PATCH | `/api/tickets/:id/status` | Update ticket status |
| DELETE | `/api/tickets/:id` | Delete a ticket |

**GET /api/tickets query params:**
- `search` — full-text search on subject/description
- `status` — `Open`, `In Progress`, or `Resolved`
- `category` — `Technical`, `Billing`, `Account`, `General`, `Other`
- `priority` — `Low`, `Medium`, `High`, `Urgent`
- `page` — page number (default: 1)
- `limit` — results per page (default: 10, max: 100)
- `sortBy` — `createdAt`, `updatedAt`, `priority`, `status`
- `sortOrder` — `asc` or `desc`

Invalid fields, filters, status values, malformed JSON, and malformed ticket IDs return `400`; a missing ticket returns `404`; an unmatched route returns `404`; oversized JSON bodies return `413`; and unexpected server errors return a generic `500` message without exposing internal details.

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Stats, charts, recent tickets |

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API and database status |

---

## Running Tests

### Backend tests

```bash
cd backend
npm test
```

Tests cover: ticket creation and validation, filtering, retrieval and invalid IDs, status updates and history recording, and dashboard stats. Backend tests require MongoDB running locally and use the separate `resolvedesk_test` database.

### Frontend tests

```bash
cd frontend
npm test
```

Tests cover: utility functions (status colors, priority colors, ID formatting).

---

## Troubleshooting

**Backend fails to connect to MongoDB**
- Ensure MongoDB service is running: `net start MongoDB` (Windows)
- Check your `MONGODB_URI` in `backend/.env`
- Default: `mongodb://127.0.0.1:27017/support_ticket_tracker`

**Frontend shows "Error loading data"**
- Ensure the backend is running on port 5000
- Check `VITE_API_URL` in `frontend/.env`
- Check browser network tab for CORS or connection errors

**Port already in use**
- Backend: change `PORT` in `backend/.env`
- Frontend: change `server.port` in `frontend/vite.config.js`

**Tests fail on backend**
- Backend tests require a running local MongoDB instance
- Tests use a separate `resolvedesk_test` database that is cleaned before/after

## Before Submission

- Keep `backend\.env` and `frontend\.env` local; commit only the placeholder `.env.example` files.
- Run backend and frontend tests and build the frontend with `npm run build --prefix frontend`.
- Seed a clean development database if you want realistic demo records (see the warning above).
- Capture the requested screenshots/demo recording yourself, then push the project to a public GitHub repository and verify the README and assets display correctly.

---

## License

MIT
