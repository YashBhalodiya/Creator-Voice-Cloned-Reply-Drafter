import logger from '../utils/logger.js';
import config from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Internal Server Error';

  // Log error with appropriate severity level
  if (statusCode >= 500) {
    logger.error(`[500 Server Error] ${req.method} ${req.originalUrl}`, err);
  } else {
    logger.warn(`[${statusCode} Client Error] ${req.method} ${req.originalUrl} - Message: ${message}`);
  }

  const response = {
    status,
    message,
    statusCode
  };

  if (err.details) {
    response.details = err.details;
  }

  // Include stack trace only in development and only for 500 errors
  if (config.nodeEnv === 'development' && statusCode >= 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
