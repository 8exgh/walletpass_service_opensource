import archiver from 'archiver';
import { logger } from '../utils/logger';
import { ApiError, ErrorCode } from '../models/passModels';
import { loadImageAssets } from '../utils/fileHelpers';

export class BundleCreator {
  /**
   * Create a .pkpass bundle (ZIP archive) containing all pass files
   */
  public async createPassBundle(
    passJson: Buffer,
    manifest: Buffer,
    signature: Buffer
  ): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        logger.info('Creating .pkpass bundle');

        // Create ZIP archive
        const archive = archiver('zip', {
          zlib: { level: 9 }, // Maximum compression
        });

        const chunks: Buffer[] = [];

        // Collect output
        archive.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        archive.on('end', () => {
          const bundle = Buffer.concat(chunks);
          logger.info(`Pass bundle created, size: ${bundle.length} bytes`);
          resolve(bundle);
        });

        archive.on('error', (err: Error) => {
          logger.error('Archive creation error', err);
          reject(new ApiError(
            ErrorCode.GENERATION_ERROR,
            `Failed to create pass bundle: ${err.message}`,
            500
          ));
        });

        // Add pass.json
        archive.append(passJson, { name: 'pass.json' });

        // Add manifest.json
        archive.append(manifest, { name: 'manifest.json' });

        // Add signature
        archive.append(signature, { name: 'signature' });

        // Load and add image assets
        const images = await loadImageAssets();
        for (const [filename, data] of images.entries()) {
          archive.append(data, { name: filename });
        }

        // Finalize the archive
        await archive.finalize();
      } catch (error: any) {
        logger.error('Failed to create pass bundle', error);
        reject(new ApiError(
          ErrorCode.GENERATION_ERROR,
          `Failed to create pass bundle: ${error.message}`,
          500
        ));
      }
    });
  }

  /**
   * Create pass bundle with custom files
   */
  public async createCustomPassBundle(
    files: Array<{ filename: string; data: Buffer }>
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        logger.info('Creating custom .pkpass bundle');

        const archive = archiver('zip', {
          zlib: { level: 9 },
        });

        const chunks: Buffer[] = [];

        archive.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        archive.on('end', () => {
          const bundle = Buffer.concat(chunks);
          logger.info(`Custom pass bundle created, size: ${bundle.length} bytes`);
          resolve(bundle);
        });

        archive.on('error', (err: Error) => {
          logger.error('Archive creation error', err);
          reject(err);
        });

        // Add all files to archive
        for (const file of files) {
          archive.append(file.data, { name: file.filename });
        }

        archive.finalize();
      } catch (error: any) {
        logger.error('Failed to create custom pass bundle', error);
        reject(error);
      }
    });
  }

  /**
   * Validate that all required files are present for a valid pass
   */
  public validatePassFiles(files: Map<string, Buffer>): string[] {
    const errors: string[] = [];
    const requiredFiles = ['pass.json', 'manifest.json', 'signature'];

    for (const file of requiredFiles) {
      if (!files.has(file)) {
        errors.push(`Missing required file: ${file}`);
      }
    }

    // Check for at least one icon file
    const hasIcon = files.has('icon.png') || files.has('icon@2x.png') || files.has('icon@3x.png');
    if (!hasIcon) {
      errors.push('At least one icon file is required (icon.png, icon@2x.png, or icon@3x.png)');
    }

    return errors;
  }

  /**
   * Extract files from a .pkpass bundle for debugging
   */
  public async extractPassBundle(_bundleBuffer: Buffer): Promise<Map<string, Buffer>> {
    // This would be implemented if needed for debugging
    // Using a ZIP library to extract files
    throw new Error('Not implemented');
  }

  /**
   * Get the MIME type for .pkpass files
   */
  public getPassMimeType(): string {
    return 'application/vnd.apple.pkpass';
  }

  /**
   * Get suggested filename for a pass
   */
  public getPassFilename(serialNumber: string): string {
    const timestamp = Date.now();
    return `pass_${serialNumber}_${timestamp}.pkpass`;
  }
}