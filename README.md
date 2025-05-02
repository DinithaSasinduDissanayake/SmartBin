# SmartBin - Intelligent Waste Management System

## Project Overview

SmartBin is a comprehensive Full-Stack application designed to streamline waste management processes for customers, staff, financial managers, and administrators. It includes features for user management, dynamic subscription handling, financial tracking (payments, expenses), automated payroll, attendance tracking, performance monitoring, document management, complaint resolution, resource management (equipment, tools, trucks), scheduling, and email notifications. This project is developed as part of the IT2080 IT Project module at SLIIT.

## Project Structure

The project is divided into two main parts:

*   **`/backend`**: Contains the Node.js/Express API server (using TypeScript), connecting to MongoDB.
*   **`/frontend`**: Contains the React application built with Vite for the user interface.
*   **`/docs`**: (Optional) Intended location for detailed documentation like diagrams, requirements specifications, etc.

```
SmartBin/
├── backend/            # Node.js/Express API (TypeScript, MongoDB)
│   ├── models/       # Mongoose schemas (.ts & .js)
│   ├── routes/       # API endpoint definitions (.ts & .js)
│   ├── controllers/  # Request handling logic (.js)
│   ├── services/     # Business logic (.js)
│   ├── middleware/   # Auth, validation, error handling (.js)
│   ├── utils/        # Helper functions (e.g., email.ts)
│   ├── config/       # Environment config loading (.js)
│   ├── errors/       # Custom error classes (.js)
│   ├── tests/          # Jest tests (unit, integration)
│   ├── uploads/        # File storage for documents
│   ├── tsconfig.json   # TypeScript configuration
│   ├── server.ts     # Main Express app setup
│   ├── .env.example    # Environment variable template
│   └── package.json
├── frontend/           # React Vite SPA
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page-level components
│   │   ├── services/     # API interaction functions (axios wrappers)
│   │   ├── contexts/     # React Context (e.g., AuthContext)
│   │   ├── hooks/        # Custom React Hooks
│   │   ├── assets/       # Images, icons and other static assets
│   │   ├── utils/        # Utility functions and helpers
│   │   └── App.jsx       # Main application component & routing
│   ├── public/         # Static assets
│   ├── .env.example    # Frontend environment variables
│   └── package.json
├── docs/               # Documentation (Diagrams, Reports - optional)
├── .gitignore
└── README.md           # This file
```
*(Note: Backend structure now includes both `.ts` and `.js` files during the transition)*

## Key Features

* **User Authentication & Authorization**
  * Secure login/registration
  * Role-based access control (customers, staff, admin, financial manager)
  * Multi-factor authentication (MFA)
  * Profile management

* **Subscription Management**
  * Dynamic subscription plans
  * Payment integration with Stripe
  * Subscription status tracking

* **Financial Management**
  * Income and expense tracking
  * Financial dashboard with analytics
  * Payment processing
  * Report generation

* **Payroll System**
  * Automated salary calculation
  * Performance-based bonuses
  * Payslip generation and distribution

* **Attendance & Performance**
  * Staff check-in/check-out tracking
  * Performance reviews and ratings
  * Analytics and reports

* **Document Management**
  * Secure document upload and storage
  * Document verification and approval (admin)
  * Document categorization

* **Complaint Handling**
  * Customer complaint submission
  * Staff assignment and resolution tracking
  * Status updates and notification

* **Resource Management & Scheduling (New)**
  * Equipment, Tool, and Truck management
  * Customer and operational scheduling
  * Map integration (e.g., Google Maps)

* **Email Notifications (New)**
  * Using Nodemailer for various system notifications.

## Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   npm (v8+) or yarn (v1.22+)
*   MongoDB (Local instance or MongoDB Atlas connection URI)
*   Git
*   (Optional) Stripe Account for payment features
*   (Optional) Gmail account with an "App Password" enabled if using Gmail for Nodemailer email transport.

### Backend Setup

1.  Navigate to the backend directory: `cd backend`
2.  Install dependencies: `npm install` or `yarn install`
3.  Copy `.env.example` to `.env`: `cp .env.example .env`
4.  **Crucially, update the `.env` file** with your `MONGODB_URI`, `JWT_SECRET`, email credentials (if using Nodemailer), and payment gateway keys if required.
5.  Run the development server: `npm run dev` (uses `ts-node-dev` for TypeScript execution and auto-restarts)
6.  To build the TypeScript code: `npm run build`
7.  To start the built JavaScript code: `npm start`
8.  (Optional) Seed initial admin/test users: `node dist/scripts/createTestUsers.js` (run after build) or adapt seeding scripts.
9.  (Optional) Seed financial data: `node dist/scripts/seedFinancialData.js` (run after build) or adapt seeding scripts.

### Frontend Setup

1.  Navigate to the frontend directory: `cd frontend`
2.  Install dependencies: `npm install` or `yarn install`
3.  Copy `.env.example` to `.env` if needed (e.g., for `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_GOOGLE_MAPS_API_KEY`). Update with your keys.
4.  Run the development server: `npm run dev`
5.  Access the application in your browser, usually at `http://localhost:5173` (check terminal output).

### Running Both Simultaneously

From the **root** directory:
1. Install all dependencies: `npm run install-all`
2. Run both frontend and backend in development mode: `npm run dev`

## Running Tests

### Backend Tests

1.  Navigate to the backend directory: `cd backend`
2.  Run tests: `npm test` (Runs Jest tests, configured to handle TypeScript)
3.  For test coverage: `npm run test:coverage`

## API Documentation

The API documentation can be accessed at the `/api-docs` endpoint when the backend server is running (if Swagger UI is implemented).

A more complete Postman collection for testing all API endpoints can be found in the `docs` folder.

## Technologies Used

### Backend
* Node.js & Express
* TypeScript & JavaScript (Hybrid during transition)
* MongoDB & Mongoose ODM
* JWT Authentication
* Stripe API for payments
* Nodemailer for email
* PDF generation for reports
* Jest for testing
* Security Middleware (helmet, cors, express-mongo-sanitize, xss-clean, hpp)
* `ts-node-dev` for development

### Frontend
* React with Hooks
* Vite build tool
* Material UI components
* Recharts for data visualization
* Axios for API communication
* React Context API for state management
* `@react-google-maps/api` for Maps integration

## Development Workflow

1. Create feature branches from `develop`
2. Implement features based on user stories
3. Write tests for critical functionality
4. Create pull requests for code reviews against `develop`
5. Merge to `develop` after approval
6. Periodically merge `develop` into `main` for stable releases.

## Contributing

Please follow these guidelines when contributing to the project:
* Use descriptive commit messages (follow project conventions if specified)
* Follow the project coding standards
* Write tests for new features
* Document API endpoints and functions

## Security Considerations

* All user inputs are validated and sanitized
* Authentication and authorization are enforced
* Passwords are securely hashed
* API endpoints have rate limiting
* File uploads are validated
* Use environment variables for sensitive keys

## License

This project is developed as part of an educational assignment and is not licensed for public use.