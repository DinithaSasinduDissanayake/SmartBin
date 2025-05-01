# SmartBin - Intelligent Waste Management System

## Project Overview

SmartBin is a comprehensive Full-Stack application designed to streamline waste management processes for customers, staff, financial managers, and administrators. It includes features for user management, dynamic subscription handling, financial tracking (payments, expenses), automated payroll, attendance tracking, performance monitoring, document management, and a complaint resolution system. This project is developed as part of the IT2080 IT Project module at SLIIT.

## Project Structure

The project is divided into two main parts:

*   **`/backend`**: Contains the Node.js/Express API server, connecting to MongoDB.
*   **`/frontend`**: Contains the React application built with Vite for the user interface.
*   **`/docs`**: (Optional) Intended location for detailed documentation like diagrams, requirements specifications, etc.

```
SmartBin/
├── backend/            # Node.js/Express API (MongoDB)
│   ├── src/
│   │   ├── controllers/  # Request handling logic
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoint definitions
│   │   ├── services/     # Business logic (e.g., payroll calculation)
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── config/       # Environment config loading
│   │   ├── errors/       # Custom error classes
│   │   ├── utils/        # Helper functions
│   │   └── server.js     # Main Express app setup
│   ├── tests/          # Jest tests (unit, integration)
│   ├── uploads/        # File storage for documents
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

## Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   npm (v8+) or yarn (v1.22+)
*   MongoDB (Local instance or MongoDB Atlas connection URI)
*   Git
*   (Optional) Stripe Account for payment features

### Backend Setup

1.  Navigate to the backend directory: `cd backend`
2.  Install dependencies: `npm install` or `yarn install`
3.  Copy `.env.example` to `.env`: `cp .env.example .env`
4.  **Crucially, update the `.env` file** with your `MONGODB_URI`, `JWT_SECRET`, and payment gateway keys if required.
5.  Run the development server: `npm run dev` (uses nodemon for auto-restarts)
6.  To start normally: `npm start`
7.  (Optional) Seed initial admin/test users: `node src/scripts/createTestUsers.js` or `node src/scripts/recreateUsers.js`
8.  (Optional) Seed financial data: `node src/scripts/seedFinancialData.js`

### Frontend Setup

1.  Navigate to the frontend directory: `cd frontend`
2.  Install dependencies: `npm install` or `yarn install`
3.  Copy `.env.example` to `.env` if needed (e.g., for `VITE_STRIPE_PUBLISHABLE_KEY`).
4.  Run the development server: `npm run dev`
5.  Access the application in your browser, usually at `http://localhost:5173` (check terminal output).

## Running Tests

### Backend Tests

1.  Navigate to the backend directory: `cd backend`
2.  Run tests: `npm test` (Runs Jest tests)
3.  For test coverage: `npm run test:coverage`

## API Documentation

The API documentation can be accessed at the `/api-docs` endpoint when the backend server is running (if Swagger UI is implemented).

A more complete Postman collection for testing all API endpoints can be found in the `docs` folder.

## Technologies Used

### Backend
* Node.js & Express
* MongoDB & Mongoose ODM
* JWT Authentication
* Stripe API for payments
* PDF generation for reports
* Jest for testing

### Frontend
* React with Hooks
* Vite build tool
* Material UI components
* Recharts for data visualization
* Axios for API communication
* React Context API for state management

## Development Workflow

1. Create feature branches from `main` or `development`
2. Implement features based on user stories
3. Write tests for critical functionality
4. Create pull requests for code reviews
5. Merge to main branch after approval
6. Deploy to staging/production

## Contributing

Please follow these guidelines when contributing to the project:
* Use descriptive commit messages
* Follow the project coding standards
* Write tests for new features
* Document API endpoints and functions

## Security Considerations

* All user inputs are validated and sanitized
* Authentication and authorization are enforced
* Passwords are securely hashed
* API endpoints have rate limiting
* File uploads are validated

## License

This project is developed as part of an educational assignment and is not licensed for public use.