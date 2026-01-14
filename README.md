# Bux - Expense Tracker

A modern, full-stack expense tracking application built with Next.js 16, featuring a feature-based architecture inspired by bulletproof-react.

## Features

- 💰 **Expense Management** - Track expenses with categories, dates, and descriptions
- 🏷️ **Category System** - Organize expenses with customizable color-coded categories
- 📊 **Budget Tracking** - Set monthly budgets per category with visual progress indicators
- � **Subscriptions** - Track recurring subscriptions with auto-expense generation
- 🧾 **Receipt Scanning** - Upload receipts and extract expense data with AI/OCR
- 📢 **Announcements** - Admin-managed global announcements for users
- 👥 **User Management** - Admin dashboard for managing users and roles
- 🎟️ **Ticket Support System** - Users can create support tickets; admins can manage, assign, and respond
- �🔐 **Authentication** - Secure email/password authentication with Better Auth
- 📈 **Dashboard** - Overview of spending patterns and budget status
- 📤 **CSV Export** - Export expense data for external analysis
- 🎨 **Modern UI** - Beautiful, responsive interface with Shadcn UI components
- 🌙 **Dark Mode** - Built-in theme switching

## Tech Stack

### Core
- **Next.js 16.1** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS 4** - Utility-first styling

### Backend
- **tRPC** - End-to-end typesafe APIs
- **Drizzle ORM** - TypeScript ORM for PostgreSQL
- **PostgreSQL** - Database
- **Better Auth** - Authentication solution
- **Zod** - Schema validation

### Frontend
- **TanStack Query** - Data fetching and caching
- **Shadcn UI** - Component library
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **Sonner** - Toast notifications
- **Date-fns** - Date manipulation
- **Tesseract.js** - OCR for receipt scanning
- **Google Generative AI** - AI-powered expense parsing

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Authenticated routes
│   │   └── dashboard/     # Dashboard pages
│   ├── (auth)/            # Auth routes (login, register)
│   └── api/               # API routes
├── features/              # Feature-based modules
│   ├── expenses/          # Expense management
│   │   ├── api/          # tRPC routers
│   │   ├── components/   # Feature components
│   │   ├── hooks/        # Custom hooks
│   │   └── types/        # TypeScript types
│   ├── categories/        # Category management
│   ├── budgets/          # Budget tracking
│   ├── subscriptions/    # Recurring subscriptions
│   ├── receipts/         # Receipt scanning with AI/OCR
│   ├── announcements/    # Admin announcements
│   ├── users/            # User management
│   ├── tickets/          # Support ticket system
│   └── auth/             # Authentication
├── components/            # Shared components
│   └── ui/               # Shadcn UI components
├── db/                    # Database schema and config
├── lib/                   # Shared utilities
└── trpc/                  # tRPC configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm/yarn/pnpm/bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ardianilyas/bux.git
cd bux
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure the following variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/bux
BETTER_AUTH_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

## Architecture

This project follows a **feature-based architecture** pattern inspired by [bulletproof-react](https://github.com/alan2207/bulletproof-react):

- **Features are self-contained** - Each feature has its own API, components, hooks, and types
- **Clear separation of concerns** - Server-side code (routers) is separate from client-side code
- **Improved maintainability** - Related code is co-located, making it easier to understand and modify
- **Better scalability** - New features can be added without affecting existing ones

### Key Conventions

- Feature `index.ts` files only export **client-side** code (components, hooks, types)
- Server-side routers are imported directly via full paths in `trpc/router.ts`
- Shared components live in `components/`, feature-specific components in `features/*/components/`
- The `proxy.ts` file (Next.js 16 middleware) handles authentication redirects

## Database Schema

- **users** - User accounts with roles (user/admin)
- **sessions** - Authentication sessions
- **categories** - Expense categories with colors
- **expenses** - Individual expense records
- **budgets** - Monthly budget limits per category
- **subscriptions** - Recurring subscription tracking
- **announcements** - Global admin announcements
- **tickets** - Support tickets
- **ticketMessages** - Ticket conversation messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
