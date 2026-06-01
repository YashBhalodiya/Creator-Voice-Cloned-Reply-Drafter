import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import logger from './utils/logger.js';
import db from './database/connection.js';

// Import Middlewares
import requestLogger from './middleware/logger.middleware.js';
import errorHandler from './middleware/error.middleware.js';

// Import Routes
import creatorRoutes from './routes/creator.routes.js';
import replyRoutes from './routes/reply.routes.js';
import questionRoutes from './routes/question.routes.js';
import draftRoutes from './routes/draft.routes.js';
import evaluationRoutes from './routes/evaluation.routes.js';

const app = express();

// Set up standard middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Register API Route Handlers
app.use('/creator', creatorRoutes);
app.use('/replies', replyRoutes);
app.use('/question', questionRoutes);
app.use('/draft', draftRoutes);
app.use('/evaluation', evaluationRoutes);

// Fallback 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware
app.use(errorHandler);

const server = app.listen(config.port, () => {
  logger.info(`🚀 Server running in [${config.nodeEnv}] mode on http://localhost:${config.port}`);
});

// Graceful shutdown handling to prevent database corruption
const shutdown = () => {
  logger.info('Shutting down server gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    try {
      db.close();
      logger.info('SQLite database connection closed successfully.');
      process.exit(0);
    } catch (err) {
      logger.error('Failed to close database connection cleanly:', err);
      process.exit(1);
    }
  });
};

// Listen for termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
export { app };
