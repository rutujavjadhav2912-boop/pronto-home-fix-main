# Pronto Home Fix - Project Documentation

This document provides a comprehensive overview of the file structure, UI/UX components, and backend architecture of the Pronto Home Fix application.

## Frontend (UI/UX) - `/src`

The frontend is built with React, Vite, Tailwind CSS, and Shadcn UI.

### `/src/pages`
- `Index.tsx`: The landing page with a hero section, features, and call to actions.
- `Auth.tsx`: Authentication page handling user login and registration.
- `Dashboard.tsx`: A routing page that displays the appropriate dashboard based on the user's role.
- `BookService.tsx`: The interface for users to book a specific service.
- `Services.tsx`: A page listing all available service categories.
- `NotFound.tsx`: 404 error page.

### `/src/components/dashboards`
- `UserDashboard.tsx`: Displays a user's current bookings, past history, and options to manage their profile.
- `WorkerDashboard.tsx`: Interface for service workers to view assigned jobs, update statuses, and manage schedules.
- `AdminDashboard.tsx`: Comprehensive dashboard for platform administrators to oversee bookings, users, and overall analytics.

### `/src/components` (Core UI)
- `Navbar.tsx` & `Footer.tsx`: Global navigation and footer components.
- `ServiceCard.tsx` & `ServiceGrid.tsx`: Components used to display individual services and grids of services.
- `ServiceCategoriesList.tsx`: Shows distinct categories for easy navigation.
- `ReviewDialog.tsx`: Dialog interface for users to leave reviews after service completion.
- `ThemeToggle.tsx`: Handles switching between light and dark modes.

### `/src/components/ui`
This directory contains all the reusable, primitive UI components provided by Shadcn UI (e.g., `button.tsx`, `dialog.tsx`, `input.tsx`, `table.tsx`, `toast.tsx`). These are styled consistently with Tailwind CSS to ensure a cohesive look.

### `/src/lib` & Utilities
- `api.ts`: Axios or Fetch configuration for communicating with the backend APIs.
- `socket.ts`: Socket.IO client configuration for real-time features.
- `utils.ts`: General helper functions.

---

## Backend (Node.js & Express) - `/server`

The backend uses Express.js and connects to a PostgreSQL database.

### `/server` (Core Files)
- `index.js`: The entry point for the backend server. It initializes Express, sets up middleware (CORS, body parsing), integrates Socket.IO for real-time events, and mounts the API routes.
- `.env`: Environment variables (database URL, JWT secret, etc.).

### `/server/routes`
- `api.js`: The central routing file that defines all endpoint paths (e.g., `/auth/login`, `/bookings`, `/admin/users`) and maps them to the appropriate controller functions.

### `/server/controllers` (Business Logic)
- `userController.js`: Handles user authentication, profile fetching, and updates.
- `bookingController.js`: Manages the lifecycle of a booking (creation, fetching, updating status).
- `workerController.js`: Handles logic specific to workers (fetching assigned jobs, updating their availability).
- `adminController.js`: Contains logic for administrative actions like fetching all users, platform analytics, and managing system-wide bookings.
- `reviewController.js`: Logic for submitting and retrieving service reviews.
- `notificationController.js`: Handles fetching and marking notifications as read.

### `/server/models` (Data Access Layer)
These files interact directly with the database via raw SQL or an ORM/query builder.
- `userModel.js`, `bookingModel.js`, `workerModel.js`, `paymentModel.js`, `analyticsModel.js`, `reviewModel.js`, `notificationModel.js`. They contain functions like `createBooking`, `getUserById`, `updateJobStatus`.

### `/server/middleware`
- `auth.js`: Middleware to verify JSON Web Tokens (JWT) and ensure that requests are authenticated. It also handles role-based access control (e.g., checking if a user is an admin or a worker).

### `/server/db`
- `index.js`: Database connection setup and pool configuration.
- `init.sql`: The SQL script used to initialize the database schema, containing `CREATE TABLE` statements for users, bookings, payments, and reviews.

### `/server/services`
- `socketService.js`: Manages WebSocket connections and emits real-time events (e.g., when a booking status changes).
- `paymentService.js`: Integrates with external payment gateways (like Stripe or Razorpay) to handle transaction processing securely.

### `/server/scripts`
Contains various utility and testing scripts used for debugging, database seeding, or manual testing (e.g., `init-db.js`, `make_admin.js`, `test_api.js`).
