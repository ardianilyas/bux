# Project Roadmap & TODOs

## 🚨 High Priority
- [x] **Refactor Code**: Refactor all code on page.tsx that used "use client" to server components
- [x] **Refactor Codes**: Refactor all codes that doesnt implement hook on component to be separate in hook function. to be more cleaner and readable code
- [x] **Form Validation**: Enhance client-side form validation across all forms (Login, Register, Create Expense, Create Ticket) to provide better user feedback using zod and add input error component for reusable input error message.
- [x] **Error Handling**: Implement global error boundaries and better toast notifications for server errors.
- [x] **Admin Feature**: Implement ban and suspend reason and duration for users
- [ ] **Refactor UI Code**: Refactor all ui code to be more cleaner and readable, separate each component that have same style and functionality to be more cleaner code
- [x] **Refactor Schema and Validation** (Partially Complete): Refactor all schema move to features folder for each schema and zod validation
  - ✅ Completed: Expenses, Budgets, Savings, Categories, Subscriptions
  - ⏸️ Paused: Users, Announcements, Audit, Tickets (schemas created, router updates pending)

## 🚀 New Features
- [ ] **Email Notifications**:
    - [ ] New ticket alerts for admins
    - [ ] Ticket reply alerts for users
    - [ ] Monthly budget alerts
- [ ] **File Attachments**: Allow users to attach images/documents to Support Tickets.
- [ ] **Multi-currency Support**: Allow users to select their preferred currency settings.
- [ ] **Export Options**: Add PDF export for monthly expense reports.

## 🛠 Improvements & Polish
- [ ] **Dashboard Widgets**: Add more interactive charts and insights to the main dashboard.
- [ ] **Mobile Experience**: Further optimize tables and complex views for mobile devices.
- [ ] **Accessibility (a11y)**: Ensure all interactive elements have proper `aria-labels` and keyboard navigation.

## ⚙️ Engineering & DevOps
- [ ] **Testing**: Set up Jest/Vitest for unit tests and Playwright for E2E testing.
- [ ] **CI/CD**: Configure GitHub Actions for automated linting and type checking.
- [ ] **Rate Limiting**: Implement rate limiting on API routes to prevent abuse.

## 🔄 Paused Tasks (Continue Later)
- [ ] **Complete Schema Refactoring**: Finish replacing inline Zod schemas with imports in remaining routers:
  - `src/features/users/api/user.router.ts`
  - `src/features/announcements/api/announcement.router.ts`
  - `src/features/audit/api/audit.router.ts`
  - `src/features/tickets/api/ticket.router.ts`
  - Note: Schema files already created in `schemas/` directories, just need to update router imports
