import dotenv from 'dotenv';
import { App } from './app';
import { config, validateConfig } from './config';
import { logger } from './utils/logger';
import { cleanupExpiredPasses } from './utils/fileHelpers';

// Load environment variables
dotenv.config();

async function startServer(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();

    // Create and initialize app
    const app = new App();
    await app.initialize();

    // Start the server
    app.listen(config.port);

    // Set up periodic cleanup of expired passes
    setInterval(async () => {
      try {
        await cleanupExpiredPasses();
        logger.debug('Cleaned up expired passes');
      } catch (error) {
        logger.error('Failed to cleanup expired passes', error);
      }
    }, 60 * 60 * 1000); // Run every hour

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      process.exit(0);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', { promise, reason });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Start the server
startServer();