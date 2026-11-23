# ResolveDesk Frontend

ResolveDesk is a React dashboard for creating, filtering, and managing support tickets.

## Requirements

- Node.js 20.19 or later, or 22.12 or later
- npm 9 or later
- A running ResolveDesk backend API

## Setup

From this directory, install dependencies and create the local environment file:

```powershell
npm install
Copy-Item .env.example .env
```

Set `VITE_API_URL` in `.env` to the backend API URL. For local development:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run

```bash
npm run dev
```

Vite serves the frontend at `http://localhost:5173`.

## Checks

```bash
npm test
npm run lint
npm run build
```

The local `.env` file is ignored by Git. Keep credentials and private configuration out of the repository.
