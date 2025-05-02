// backend/errors/UnauthorizedError.ts
import AppError from './AppError';

export default class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}