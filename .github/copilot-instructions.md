# SmartBin Project Guidelines

## Project Structure Overview
This project follows a full-stack architecture with separate frontend and backend components:
- **Frontend**: React application built with Vite
- **Backend**: Node.js Express API server with MongoDB database

## Coding Conventions

### General
- Use camelCase for variables and functions
- Use PascalCase for React components and class names
- Use descriptive variable and function names
- Add comments for complex logic
- Follow clean code principles

### Frontend Conventions
- Use functional components with React hooks
- Organize components by feature in their respective folders
- Keep components modular and reusable
- Use context API for state management
- Use CSS modules for component styling
- Follow responsive design principles

### Backend Conventions
- Follow MVC pattern (Models, Controllers, Routes)
- Use async/await for asynchronous operations
- Implement proper error handling with custom error classes
- Use environment variables for configuration
- Implement middleware for authentication and validation
- Validate all input data

## Project Features
- User authentication and authorization
- Document management
- Attendance tracking
- Financial management (expenses, payments)
- Performance monitoring
- Subscription plans management
- User profile management

## Development Workflow
- Git Bash is the default terminal for all development operations
- Run the frontend and backend separately during development
- For frontend: `cd frontend && npm run dev`
- For backend: `cd backend && npm run dev`
- Use Git for version control
- Write tests for critical functionality

## Testing
- Jest for backend testing
- Unit tests for models and services
- Integration tests for API endpoints
- Test coverage should be maintained above 70%

## API Structure
- RESTful API design
- JWT authentication
- Consistent error response format
- Proper input validation

## Database Structure
- MongoDB with Mongoose ODM
- Properly defined schemas with validation
- Use indexes for frequently queried fields
- Implement proper relationships between collections

## Security Considerations
- Sanitize all user inputs
- Store passwords with proper hashing
- Implement rate limiting for API endpoints
- Use HTTPS in production
- Validate and sanitize file uploads

## Performance Guidelines

### Backend Performance
- Optimize database queries with proper indexing
- Implement pagination for large data sets
- Use efficient data structures and algorithms
- Apply database connection pooling
- Implement caching strategies for frequently accessed data
- Use compression for API responses

### Frontend Performance
- Optimize bundle size with code splitting
- Implement lazy loading for components and routes
- Use memoization for expensive calculations
- Optimize images and assets
- Implement virtual scrolling for long lists
- Minimize unnecessary re-renders

### Network Optimization
- Minimize API calls by batching requests
- Implement efficient data fetching strategies
- Use HTTP/2 for multiplexing connections
- Apply proper CDN usage for static assets
- Implement service workers for offline capabilities

### Monitoring and Profiling
- Set up performance monitoring tools
- Regularly profile application performance
- Establish performance benchmarks and budgets
- Monitor server resource utilization

## Git Workflow Guidelines
- Check git status after making changes: `git status`
- Add all modified files: `git add .`
- Create commits with both a brief message AND a detailed description:
  ```
  git commit -m "Brief summary message" -m "- Detailed point 1
  - Detailed point 2
  - Detailed point 3
  - Explain why changes were made
  - Describe key implementation details"
  ```
- The first `-m` parameter is the commit message (title)
- The second `-m` parameter is the detailed point-form description
- Push changes to the remote repository: `git push`
- Commit after every significant change or feature implementation
- Pull before starting work: `git pull`
- Create feature branches for major changes

remind me to git commit and push your changes after completing significant work!