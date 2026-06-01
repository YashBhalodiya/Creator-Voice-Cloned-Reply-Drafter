import morgan from 'morgan';
import logger from '../utils/logger.js';
import config from '../config/env.js';

// Pipe morgan logs into our custom logger
const stream = {
  write: (message) => logger.info(message.trim())
};

// Log all requests in dev, log only errors/warnings in prod if desired (let's log all requests for transparency)
const skip = () => {
  return false;
};

export const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

export default requestLogger;
