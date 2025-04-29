# SmartBin

## Project Overview

SmartBin is a full-stack application designed to provide a smart waste management solution. It includes features for user management (customers, staff, admin, financial managers), subscription handling, financial tracking (payments, expenses), payroll management, attendance tracking, performance monitoring, document uploads, and complaint handling.

## Project Structure

The project is divided into two main parts:

*   **`/backend`**: Contains the Node.js/Express API server, connecting to MongoDB.
*   **`/frontend`**: Contains the React application built with Vite for the user interface.
*   **`/docs`**: (Optional) Intended location for detailed documentation like diagrams, requirements specifications, etc.

```
SmartBin
├─ backend
│  ├─ .env.example          # Example environment variables
│  ├─ jest.config.js        # Jest testing configuration
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ config
│  │  ├─ controllers
│  │  ├─ middleware
│  │  ├─ models
│  │  ├─ server.js
│  │  ├─ routes
│  │  ├─ services
│  │  └─ utils
│  └─ tests
│     ├─ setup.js            # Test setup for in-memory DB
│     ├─ integration
│     └─ unit
├─ docs
├─ frontend
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  └─ vite.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  └─ react.svg
│  │  ├─ components
│  │  │  ├─ forms
│  │  │  └─ ui
│  │  ├─ contexts
│  │  ├─ hooks
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  ├─ services
│  │  └─ utils
│  └─ vite.config.js
└─ README.md
```

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   MongoDB (local instance or connection URI to a cloud instance like MongoDB Atlas)
*   Git

### Backend Setup

1.  Navigate to the backend directory: `cd backend`
2.  Install dependencies: `npm install` or `yarn install`
3.  Create a `.env` file based on `.env.example`. Fill in necessary values, especially `MONGODB_URI` and `JWT_SECRET`. Add Stripe keys if using payment features.
4.  Run the development server: `npm run dev` (uses nodemon for auto-restarts)
5.  To start normally: `npm start`
6.  (Optional) Seed initial test users: `node src/scripts/createTestUsers.js` or `node src/scripts/recreateUsers.js`
7.  (Optional) Seed financial data: `node src/scripts/seedFinancialData.js`

### Frontend Setup

1.  Navigate to the frontend directory: `cd frontend`
2.  Install dependencies: `npm install` or `yarn install`
3.  Create a `.env` file if needed (e.g., for `VITE_STRIPE_PUBLISHABLE_KEY`).
4.  Run the development server: `npm run dev`
5.  Access the application in your browser, usually at `http://localhost:5173` (check terminal output).