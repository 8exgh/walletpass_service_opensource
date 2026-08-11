import { Router } from 'express';
import { PassController } from '../controllers/passController';
import { authenticateApiKey } from '../middleware/auth';
import { validatePassGenerationRequest, validateRequestSize } from '../middleware/validator';
import { passGenerationRateLimiter, apiRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';
import { getPrivacyPolicyHTML } from '../templates/privacyPolicy';
import { getSupportPageHTML } from '../templates/supportPage';

const router = Router();
const passController = new PassController();

// API info endpoint (public)
router.get(
  '/',
  apiRateLimiter,
  asyncHandler(async (req, res) => passController.getApiInfo(req, res))
);

// Health check endpoint (public)
router.get(
  '/health',
  apiRateLimiter,
  asyncHandler(async (req, res) => passController.healthCheck(req, res))
);

// Privacy Policy endpoint (public, no rate limiting for legal pages)
router.get('/privacy_policy', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(getPrivacyPolicyHTML());
});

// Support page endpoint (public, no rate limiting)
router.get('/gympass/support', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(getSupportPageHTML());
});

// Generate pass endpoint (requires authentication)
router.post(
  '/passes/generate',
  authenticateApiKey,
  passGenerationRateLimiter,
  validateRequestSize(1024 * 1024), // 1MB max
  validatePassGenerationRequest,
  asyncHandler(async (req, res) => passController.generatePass(req, res))
);

// Download pass endpoint (public but requires valid passId)
router.get(
  '/passes/download/:passId',
  apiRateLimiter,
  asyncHandler(async (req, res) => passController.downloadPass(req, res))
);

export default router;