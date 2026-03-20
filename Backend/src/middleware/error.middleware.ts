import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error for debugging
  if (err.statusCode === 500) {
    console.error('ERROR ', err);
  } else {
     // Reduced logging (or no logging) for operational errors to avoid clutter/confusion
     console.warn(`Error ${err.statusCode}: ${err.message}`);
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};