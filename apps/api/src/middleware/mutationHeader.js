import { AppError } from './errorHandler.js';

const MUTATION_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

export function requireMutationHeader(req, res, next) {
  if (MUTATION_METHODS.includes(req.method)) {
    const xRequestedWith = req.headers['x-requested-with'];
    
    if (xRequestedWith !== 'XMLHttpRequest') {
      return next(new AppError('Missing required header: X-Requested-With', 400, 'MISSING_HEADER'));
    }
  }
  
  next();
}

