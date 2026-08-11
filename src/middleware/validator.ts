import { Request, Response, NextFunction } from 'express';
import { GeneratePassRequest, ErrorCode, ApiError } from '../models/passModels';
import { logger } from '../utils/logger';

/**
 * Validate pass generation request
 */
export function validatePassGenerationRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const body = req.body as GeneratePassRequest;
    const errors: string[] = [];

    // Validate required fields
    if (!body.passType) {
      errors.push('passType is required');
    } else if (!['generic', 'boardingPass', 'coupon', 'eventTicket', 'storeCard'].includes(body.passType)) {
      errors.push('Invalid passType');
    }

    if (!body.serialNumber) {
      errors.push('serialNumber is required');
    }

    if (!body.metadata) {
      errors.push('metadata is required');
    } else {
      if (!body.metadata.description) {
        errors.push('metadata.description is required');
      }
      if (!body.metadata.organizationName) {
        errors.push('metadata.organizationName is required');
      }
    }

    // Validate data structure
    if (body.data) {
      // Validate fields
      const validateFields = (fields: any[] | undefined, fieldName: string) => {
        if (fields && !Array.isArray(fields)) {
          errors.push(`${fieldName} must be an array`);
        } else if (fields) {
          fields.forEach((field, index) => {
            if (!field.key) {
              errors.push(`${fieldName}[${index}].key is required`);
            }
            if (!field.label) {
              errors.push(`${fieldName}[${index}].label is required`);
            }
            if (field.value === undefined || field.value === null) {
              errors.push(`${fieldName}[${index}].value is required`);
            }
          });
        }
      };

      validateFields(body.data.headerFields, 'data.headerFields');
      validateFields(body.data.primaryFields, 'data.primaryFields');
      validateFields(body.data.secondaryFields, 'data.secondaryFields');
      validateFields(body.data.auxiliaryFields, 'data.auxiliaryFields');
      validateFields(body.data.backFields, 'data.backFields');

      // Validate barcode
      if (body.data.barcode) {
        if (!body.data.barcode.format) {
          errors.push('data.barcode.format is required');
        }
        if (!body.data.barcode.message) {
          errors.push('data.barcode.message is required');
        }
      }
    }

    // Check for errors
    if (errors.length > 0) {
      logger.warn('Validation errors in pass generation request', { errors });
      throw new ApiError(
        ErrorCode.INVALID_INPUT,
        `Validation failed: ${errors.join(', ')}`,
        400
      );
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    } else {
      next(error);
    }
  }
}

/**
 * Validate request body size
 */
export function validateRequestSize(maxSize: number = 1024 * 1024) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      res.status(413).json({
        success: false,
        error: {
          code: ErrorCode.INVALID_INPUT,
          message: `Request body too large. Maximum size is ${maxSize} bytes`,
        },
      });
      return;
    }
    
    next();
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Basic HTML entity encoding
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  } else if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  } else if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  return input;
}