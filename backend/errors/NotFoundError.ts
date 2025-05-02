// backend/errors/NotFoundError.ts
import AppError from './AppError';

export default class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}