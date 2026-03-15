# FinHub

Personal finance management platform with AI-powered insights.

## Stack

- **Frontend**: React 18 + React Router v6 + Tailwind CSS (Vite)
- **Backend**: PHP (REST API)
- **Database**: MySQL / MariaDB

## Project Structure

```
FinHub/
├── frontend/        # React app
│   └── src/
│       ├── dal/     # Data Access Layer  – raw fetch calls
│       ├── bll/     # Business Logic Layer – validation & rules
│       ├── pages/   # Public pages (Login, Register)
│       ├── admin/   # Admin panel pages
│       ├── components/
│       │   ├── common/   # Shared UI (Button, Input, Modal…)
│       │   └── layout/   # AdminLayout, Sidebar, Topbar
│       ├── context/      # React Context (Auth)
│       ├── hooks/        # Custom hooks
│       └── utils/        # Formatters, helpers
├── backend/         # PHP REST API
│   ├── config/      # DB connection, global config
│   ├── models/      # Plain PHP model classes
│   ├── dal/         # DB queries (PDO)
│   ├── bll/         # Business rules
│   ├── ws/          # API endpoints (Web Services)
│   └── middleware/  # Auth checks
└── database/
    └── FinHub.sql
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

- Point Apache/Nginx to `backend/`
- Copy `.env.example` to `.env` and fill in DB credentials
- Import `database/FinHub.sql` into MySQL