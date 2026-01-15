# Project Roadmap & TODOs

## 🚨 High Priority
- [x] **Refactor Code**: Refactor all code on page.tsx that used "use client" to server components
- [x] **Refactor Codes**: Refactor all codes that doesnt implement hook on component to be separate in hook function. to be more cleaner and readable code
- [x] **Form Validation**: Enhance client-side form validation across all forms (Login, Register, Create Expense, Create Ticket) to provide better user feedback using zod and add input error component for reusable input error message.
- [x] **Error Handling**: Implement global error boundaries and better toast notifications for server errors.

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
