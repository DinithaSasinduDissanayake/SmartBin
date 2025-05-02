// backend/errors/ForbiddenError.ts
import AppError from './AppError';

export default class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
  }
}