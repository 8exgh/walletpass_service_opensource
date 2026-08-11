import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  // Server Configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',

  // API Authentication
  apiKeys: process.env.API_KEYS?.split(',').map(key => key.trim()) || [],

  // Apple Developer Configuration
  certificates: {
    passTypeId: process.env.PASS_TYPE_ID || 'pass.com.example.generic',
    teamId: process.env.TEAM_ID || '',
    certPath: process.env.CERT_PATH ? path.resolve(process.env.CERT_PATH) : path.resolve('/app/certificates/pass-cert.p12'),
    certPassword: process.env.CERT_PASSWORD || '',
    wwdrPath: process.env.WWDR_PATH ? path.resolve(process.env.WWDR_PATH) : path.resolve('/app/certificates/wwdr.pem'),
  },

  // Storage Configuration
  storage: {
    tempDir: process.env.TEMP_DIR ? path.resolve(process.env.TEMP_DIR) : path.resolve('/app/data/temp'),
    passesDir: process.env.PASSES_DIR ? path.resolve(process.env.PASSES_DIR) : path.resolve('/app/data/generated-passes'),
    ttl: parseInt(process.env.PASS_TTL || '3600', 10), // seconds
  },

  // Rate Limiting
  limits: {
    maxPassSize: 10 * 1024 * 1024, // 10MB
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '60', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Paths
  paths: {
    assets: path.resolve('./assets/pass-templates/generic'),
  },
};

// Validate configuration
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.certificates.teamId) {
    errors.push('TEAM_ID is required');
  }

  if (!config.certificates.passTypeId) {
    errors.push('PASS_TYPE_ID is required');
  }

  if (config.apiKeys.length === 0) {
    console.warn('Warning: No API keys configured. API authentication is disabled.');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}