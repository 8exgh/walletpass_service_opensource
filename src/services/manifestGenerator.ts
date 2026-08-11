import { calculateSHA1 } from '../utils/crypto';
import { FileHash } from '../types';
import { logger } from '../utils/logger';

export class ManifestGenerator {
  /**
   * Generate manifest.json containing SHA-1 hashes of all files in the pass bundle
   */
  public async generateManifest(files: Map<string, Buffer>): Promise<Buffer> {
    logger.info('Generating manifest.json');

    const manifest: FileHash = {};

    // Calculate SHA-1 hash for each file
    for (const [filename, data] of files.entries()) {
      const hash = await calculateSHA1(data);
      manifest[filename] = hash;
      logger.debug(`Hash for ${filename}: ${hash}`);
    }

    // Convert manifest to JSON
    const manifestJson = JSON.stringify(manifest, null, 2);
    return Buffer.from(manifestJson, 'utf-8');
  }

  /**
   * Add a file to the manifest
   */
  public async addFileToManifest(
    manifest: FileHash,
    filename: string,
    data: Buffer
  ): Promise<void> {
    const hash = await calculateSHA1(data);
    manifest[filename] = hash;
  }

  /**
   * Validate manifest structure
   */
  public validateManifest(manifest: FileHash): boolean {
    // Check for required files
    const requiredFiles = ['pass.json'];
    
    for (const file of requiredFiles) {
      if (!manifest[file]) {
        logger.error(`Missing required file in manifest: ${file}`);
        return false;
      }
    }

    // Validate hash format (should be 40 character hex string)
    const hashRegex = /^[a-f0-9]{40}$/;
    for (const [file, hash] of Object.entries(manifest)) {
      if (!hashRegex.test(hash)) {
        logger.error(`Invalid hash format for file ${file}: ${hash}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Create manifest from file list with content
   */
  public async createManifestFromFiles(
    files: Array<{ filename: string; data: Buffer }>
  ): Promise<{ manifest: FileHash; manifestBuffer: Buffer }> {
    const manifest: FileHash = {};

    for (const file of files) {
      await this.addFileToManifest(manifest, file.filename, file.data);
    }

    const manifestBuffer = Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8');
    
    return { manifest, manifestBuffer };
  }
}