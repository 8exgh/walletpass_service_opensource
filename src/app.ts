import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import passRoutes from './routes/passRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { ensureDirectoryExists } from './utils/fileHelpers';
import path from 'path';

export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors({
      origin: '*', // Configure based on your needs
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'x-bundle-id'],
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (config.env === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Trust proxy for accurate IP addresses
    this.app.set('trust proxy', true);
  }

  private initializeRoutes(): void {
    // Serve static images
    this.app.use('/images', express.static('images'));
    
    // API routes
    this.app.use(`/api/${config.apiVersion}`, passRoutes);

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        name: 'Apple Wallet Pass API',
        version: config.apiVersion,
        documentation: `/api/${config.apiVersion}`,
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async initialize(): Promise<void> {
    try {
      // In production/Docker, directories should already exist as volumes
      // Only try to create them in development
      if (config.env === 'development') {
        await ensureDirectoryExists(config.storage.tempDir);
        await ensureDirectoryExists(config.storage.passesDir);
        await ensureDirectoryExists(config.paths.assets);
        await ensureDirectoryExists(path.resolve('./certificates'));
      } else {
        // In production, just log the paths being used
        logger.info('Using storage paths:', {
          tempDir: config.storage.tempDir,
          passesDir: config.storage.passesDir,
          assets: config.paths.assets,
        });
      }

      logger.info('Application initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize application', error);
      throw error;
    }
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`API endpoint: http://localhost:${port}/api/${config.apiVersion}`);
      logger.info(`Environment: ${config.env}`);
      
      if (config.apiKeys.length === 0) {
        logger.warn('⚠️  No API keys configured - authentication is disabled');
      } else {
        logger.info(`✓ API authentication enabled with ${config.apiKeys.length} key(s)`);
      }
    });
  }
}