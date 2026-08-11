import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';

/**
 * Middleware to authenticate API requests using API keys
 */
export function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers['x-bundle-id'] as string;

  // If no API keys are configured, skip authentication (development mode)
  if (config.apiKeys.length === 0) {
    logger.warn('API authentication is disabled - no API keys configured');
    next();
    return;
  }

  if (!apiKey) {
    logger.warn('Missing API key in request', { 
      ip: req.ip,
      path: req.path 
    });
    
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'API key is required',
      },
    });
    return;
  }

  // Check if API key is valid
  if (!config.apiKeys.includes(apiKey)) {
    logger.warn('Invalid API key attempted', { 
      ip: req.ip,
      path: req.path 
    });
    
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid bundle id',
      },
    });
    return;
  }

  // Add API key to request for logging
  (req as AuthenticatedRequest).apiKey = apiKey;
  
  logger.debug('API key authenticated', { 
    ip: req.ip,
    path: req.path 
  });
  
  next();
}

/**
 * Optional authentication middleware (for public endpoints)
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers['x-bundle-id'] as string;

  if (apiKey && config.apiKeys.includes(apiKey)) {
    (req as AuthenticatedRequest).apiKey = apiKey;
  }

  next();
}