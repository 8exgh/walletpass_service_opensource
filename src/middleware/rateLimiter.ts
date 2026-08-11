import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { config } from '../config';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';

/**
 * Create rate limiter for API endpoints
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.limits.maxRequestsPerMinute,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    // Use API key if available, otherwise use IP
    const authReq = req as AuthenticatedRequest;
    if (authReq.apiKey) {
      return authReq.apiKey;
    }
    // Use ipKeyGenerator for proper IPv6 handling (64 is the default IPv6 subnet)
    // req.ip might be undefined, so provide a fallback
    return ipKeyGenerator(req.ip || 'unknown', 64);
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    });
  },
});

/**
 * Stricter rate limiter for pass generation
 */
export const passGenerationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: Math.floor(config.limits.maxRequestsPerMinute / 2), // Half of normal limit
  message: 'Too many pass generation requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    const authReq = req as AuthenticatedRequest;
    if (authReq.apiKey) {
      return authReq.apiKey;
    }
    // Use ipKeyGenerator for proper IPv6 handling (64 is the default IPv6 subnet)
    // req.ip might be undefined, so provide a fallback
    return ipKeyGenerator(req.ip || 'unknown', 64);
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many pass generation requests, please try again later',
      },
    });
  },
});