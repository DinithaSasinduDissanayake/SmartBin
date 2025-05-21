// backend/errors/BadRequestError.ts
import AppError from './AppError';

export default class BadRequestError extends AppError {
  errors?: string[];
  
  constructor(message: string = 'Bad Request', errors?: string[]) {
    super(message, 400);
    this.errors = errors;
  }
}