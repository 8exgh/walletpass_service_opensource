import { Request, Response } from 'express';
import { PassGenerator } from '../services/passGenerator';
import { ManifestGenerator } from '../services/manifestGenerator';
import { PassSignature } from '../services/passSignature';
import { BundleCreator } from '../services/bundleCreator';
import { GeneratePassRequest, GeneratePassResponse, ApiError, ErrorCode, PassMetadata } from '../models/passModels';
import { generatePassId, generateSerialNumber } from '../utils/crypto';
import { saveFile, getPassFilePath, fileExists, loadFile, loadImageAssets } from '../utils/fileHelpers';
import { logger } from '../utils/logger';
import { config } from '../config';

export class PassController {
  private passGenerator: PassGenerator;
  private manifestGenerator: ManifestGenerator;
  private passSignature: PassSignature;
  private bundleCreator: BundleCreator;
  private passStore: Map<string, PassMetadata>;

  constructor() {
    this.passGenerator = new PassGenerator();
    this.manifestGenerator = new ManifestGenerator();
    this.passSignature = new PassSignature();
    this.bundleCreator = new BundleCreator();
    this.passStore = new Map();

    // Initialize signature service
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    try {
      await this.passSignature.loadCertificates();
      logger.info('Pass controller initialized successfully***1');
    } catch (error) {
      logger.error('Failed to initialize pass controller', error);
    }
  }

  /**
   * Generate a new Apple Wallet pass
   */
  public async generatePass(req: Request, res: Response): Promise<void> {
    logger.info(`generatePass ${JSON.stringify(req.body)}`);
    try {
      const requestData = req.body as GeneratePassRequest;

      // Use provided serial number or generate a new one
      if (!requestData.serialNumber) {
        requestData.serialNumber = generateSerialNumber();
      }

      logger.info('Generating pass', { 
        serialNumber: requestData.serialNumber,
        passType: requestData.passType 
      });

      // Validate pass data
      const validationErrors = this.passGenerator.validatePassData(requestData);
      if (validationErrors.length > 0) {
        throw new ApiError(
          ErrorCode.INVALID_INPUT,
          `Validation failed: ${validationErrors.join(', ')}`,
          400
        );
      }

      // Step 1: Generate pass.json
      const passJson = this.passGenerator.generatePassJson(requestData);
      const passJsonBuffer = Buffer.from(JSON.stringify(passJson, null, 2), 'utf-8');

      // Step 2: Load image assets
      const images = await loadImageAssets();
      
      // Step 3: Create file map for manifest
      const files = new Map<string, Buffer>();
      files.set('pass.json', passJsonBuffer);
      
      // Add images to file map
      for (const [filename, data] of images.entries()) {
        files.set(filename, data);
      }

      // Step 4: Generate manifest.json
      const manifestBuffer = await this.manifestGenerator.generateManifest(files);
      
      // Step 5: Sign the manifest
      const signatureBuffer = await this.passSignature.signManifest(manifestBuffer);

      // Step 6: Create .pkpass bundle
      const passBundle = await this.bundleCreator.createPassBundle(
        passJsonBuffer,
        manifestBuffer,
        signatureBuffer
      );

      // Step 7: Save the pass
      const passId = generatePassId();
      const filename = this.bundleCreator.getPassFilename(requestData.serialNumber);
      const filepath = getPassFilePath(filename);
      
      await saveFile(filepath, passBundle);

      // Store pass metadata
      const metadata: PassMetadata = {
        id: passId,
        serialNumber: requestData.serialNumber,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + config.storage.ttl * 1000),
        filename: filename,
      };
      this.passStore.set(passId, metadata);

      // Create download URL
      const passUrl = `${req.protocol}://${req.get('host')}/api/${config.apiVersion}/passes/download/${passId}`;

      // Send response
      const response: GeneratePassResponse = {
        success: true,
        data: {
          passUrl,
          passId,
          serialNumber: requestData.serialNumber,
          expiresAt: metadata.expiresAt.toISOString(),
        },
      };

      logger.info('Pass generated successfully', { 
        passId,
        serialNumber: requestData.serialNumber 
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Failed to generate pass', error);
      
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      } else {
        // Include the actual error message for debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error('Unexpected error in generatePass:', { 
          message: errorMessage, 
          stack: error instanceof Error ? error.stack : undefined 
        });
        
        res.status(500).json({
          success: false,
          error: {
            code: ErrorCode.GENERATION_ERROR,
            message: `Failed to generate pass: ${errorMessage}`,
          },
        });
      }
    }
  }

  /**
   * Download a generated pass
   */
  public async downloadPass(req: Request, res: Response): Promise<void> {
    try {
      const { passId } = req.params;

      logger.info('Downloading pass', { passId });

      // Get pass metadata
      const metadata = this.passStore.get(passId);
      if (!metadata) {
        throw new ApiError(
          ErrorCode.NOT_FOUND,
          'Pass not found or expired',
          404
        );
      }

      // Check if pass has expired
      if (metadata.expiresAt < new Date()) {
        this.passStore.delete(passId);
        throw new ApiError(
          ErrorCode.NOT_FOUND,
          'Pass has expired',
          404
        );
      }

      // Load pass file
      const filepath = getPassFilePath(metadata.filename);
      if (!(await fileExists(filepath))) {
        this.passStore.delete(passId);
        throw new ApiError(
          ErrorCode.NOT_FOUND,
          'Pass file not found',
          404
        );
      }

      const passData = await loadFile(filepath);

      // Set headers for download
      res.setHeader('Content-Type', this.bundleCreator.getPassMimeType());
      res.setHeader('Content-Disposition', `attachment; filename="${metadata.filename}"`);
      res.setHeader('Content-Length', passData.length.toString());

      logger.info('Pass downloaded successfully', { passId });

      // Send the pass file
      res.status(200).send(passData);
    } catch (error) {
      logger.error('Failed to download pass', error);
      
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: 'Failed to download pass',
          },
        });
      }
    }
  }

  /**
   * Health check endpoint
   */
  public async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      // Check if certificates are loaded and valid
      const certValid = await this.passSignature.verifyCertificates();
      const certExpiration = await this.passSignature.getCertificateExpiration();

      res.status(200).json({
        success: true,
        status: 'healthy',
        version: config.apiVersion,
        certificate: {
          valid: certValid,
          expiresAt: certExpiration?.toISOString(),
        },
        storage: {
          activePasses: this.passStore.size,
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: 'Service health check failed',
      });
    }
  }

  /**
   * Get API information
   */
  public async getApiInfo(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      name: 'Apple Wallet Pass API',
      version: config.apiVersion,
      endpoints: [
        {
          method: 'POST',
          path: `/api/${config.apiVersion}/passes/generate`,
          description: 'Generate a new Apple Wallet pass',
        },
        {
          method: 'GET',
          path: `/api/${config.apiVersion}/passes/download/:passId`,
          description: 'Download a generated pass',
        },
        {
          method: 'GET',
          path: `/api/${config.apiVersion}/health`,
          description: 'Health check endpoint',
        },
      ],
    });
  }
}