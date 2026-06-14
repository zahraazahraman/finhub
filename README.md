# FinHub

A personal finance management web app that helps users track expenses, manage accounts, monitor investments, set financial goals, and connect with financial consultants — all in one place.

## Features

### For Users
- **Dashboard** — spending overview, net worth summary, and recent activity at a glance
- **Accounts** — track multiple bank and credit accounts with balance history
- **Transactions** — log and categorize expenses and income; import via spreadsheet
- **Receipt Scanning** — AI-powered receipt parser that extracts merchant, date, and items automatically
- **Investments** — track portfolio holdings and performance
- **Goals** — set and monitor savings goals with progress tracking
- **Reminders** — bill and payment reminders
- **Exchange Rates** — live currency conversion
- **Consultants** — browse, book, and chat with financial consultants
- **Notifications** — in-app alerts for activity and updates
- **PDF Export** — export reports and statements as PDFs

### For Consultants
- **Dashboard** — overview of active clients and inquiries
- **Inquiries** — manage and respond to client requests
- **Chat** — encrypted real-time messaging with clients

### For Admins
- **User Management** — view and manage all users
- **Consultant Applications** — review and approve consultant registrations
- **Category Management** — manage transaction categories
- **Notifications** — broadcast system-wide alerts

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS 4, Recharts, jsPDF |
| Build Tool | Vite |
| Backend | PHP 8 (custom REST API) |
| Database | MySQL |
| AI | Groq API — Llama 3.3 70B (receipt parsing) |
| OCR | Tesseract (receipt text extraction) |
| Email | Mailtrap API |
| Spreadsheet | PhpSpreadsheet (XLSX transaction import) |

## Project Structure

```
FinHub/
├── frontend/          # React app (Vite)
│   └── src/
│       ├── pages/     # Route-level page components
│       ├── user/      # User feature pages
│       ├── consultant/# Consultant feature pages
│       ├── admin/     # Admin feature pages
│       ├── components/# Shared UI components
│       ├── bll/       # Business logic layer
│       ├── dal/       # Data access layer (API calls)
│       ├── hooks/     # Custom React hooks
│       └── context/   # React context providers
├── backend/           # PHP REST API
│   ├── ws/            # API endpoint handlers
│   ├── services/      # Business services (email, encryption, AI)
│   ├── models/        # Data models
│   ├── dal/           # Database access layer
│   ├── middleware/     # Auth and request middleware
│   └── config/        # App and database config
└── database/          # SQL schema and migration files
```

## Getting Started

### Prerequisites
- XAMPP (Apache + MySQL + PHP 8)
- Node.js 18+
- Composer

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/FinHub.git
   cd FinHub
   ```

2. **Database**
   - Start MySQL in XAMPP
   - Import `database/FinHub.sql` via phpMyAdmin or CLI:
     ```bash
     mysql -u root -p finhub < database/FinHub.sql
     ```

3. **Backend**
   ```bash
   cd backend
   composer install
   ```
   - Copy `config/config.php` and fill in your database credentials and API keys

4. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Open `http://localhost:5173` in your browser

## Live Demo

[https://finhubapp.app](https://finhubapp.app)

## License

This project was developed as a senior capstone project.
