import forge from 'node-forge';
import fs from 'fs';
import { promisify } from 'util';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ApiError, ErrorCode } from '../models/passModels';
import { CertificateData } from '../types';

const readFile = promisify(fs.readFile);

export class PassSignature {
  private certificateData: CertificateData | null = null;

  /**
   * Load certificates for signing
   */
  public async loadCertificates(): Promise<void> {
    try {
      logger.info('Loading certificates for signing');

      // Load P12 certificate
      const p12Buffer = await readFile(config.certificates.certPath);
      logger.debug(`P12 file loaded, size: ${p12Buffer.length} bytes`);
      
      // P12 files are already in DER format, no need to decode from base64
      const p12Der = forge.util.createBuffer(p12Buffer.toString('binary'), 'raw');
      const p12Asn1 = forge.asn1.fromDer(p12Der);
      
      // Parse P12 with password
      const p12 = forge.pkcs12.pkcs12FromAsn1(
        p12Asn1,
        config.certificates.certPassword
      );

      // Extract certificate and private key
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

      const cert = certBags[forge.pki.oids.certBag]?.[0]?.cert;
      const key = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0]?.key;

      if (!cert || !key) {
        throw new Error('Failed to extract certificate or key from P12 file');
      }

      // Load WWDR certificate
      const wwdrBuffer = await readFile(config.certificates.wwdrPath);
      const wwdrPem = wwdrBuffer.toString('utf-8');

      this.certificateData = {
        cert,
        key,
        wwdr: wwdrPem,
      };

      logger.info('Certificates loaded successfully');
      
      // Log certificate details for debugging
      logger.debug('Certificate details:', {
        subject: this.certificateData.cert.subject.attributes.map((attr: any) => ({
          name: attr.name,
          value: attr.value
        })),
        issuer: this.certificateData.cert.issuer.attributes.map((attr: any) => ({
          name: attr.name,
          value: attr.value
        })),
        validity: {
          notBefore: this.certificateData.cert.validity.notBefore,
          notAfter: this.certificateData.cert.validity.notAfter
        }
      });
    } catch (error: any) {
      logger.error('Failed to load certificates', {
        message: error.message,
        stack: error.stack,
        certPath: config.certificates.certPath,
        wwdrPath: config.certificates.wwdrPath
      });
      throw new ApiError(
        ErrorCode.CERT_ERROR,
        `Failed to load certificates: ${error.message}`,
        500
      );
    }
  }

  /**
   * Create PKCS#7 detached signature for the manifest
   */
  public async signManifest(manifestBuffer: Buffer): Promise<Buffer> {
    if (!this.certificateData) {
      await this.loadCertificates();
    }

    if (!this.certificateData) {
      throw new ApiError(
        ErrorCode.CERT_ERROR,
        'Certificates not loaded',
        500
      );
    }

    try {
      logger.info('Creating PKCS#7 signature for manifest');

      const { cert, key, wwdr } = this.certificateData;

      // Create PKCS#7 signed data
      const p7 = forge.pkcs7.createSignedData();
      
      // Set the content to be signed (manifest)
      p7.content = forge.util.createBuffer(manifestBuffer.toString('binary'), 'raw');

      // Add the signing certificate
      p7.addCertificate(cert);

      // Add WWDR intermediate certificate
      const wwdrCert = forge.pki.certificateFromPem(wwdr);
      p7.addCertificate(wwdrCert);

      // Add signer
      p7.addSigner({
        key: key,
        certificate: cert,
        digestAlgorithm: forge.pki.oids.sha256,
        authenticatedAttributes: [
          {
            type: forge.pki.oids.contentType,
            value: forge.pki.oids.data,
          },
          {
            type: forge.pki.oids.messageDigest,
            // Value will be auto-calculated
          },
          {
            type: forge.pki.oids.signingTime,
            value: new Date().toISOString(),
          },
        ],
      });

      // Sign in detached mode
      p7.sign({ detached: true });

      // Convert to DER format
      const asn1 = p7.toAsn1();
      const der = forge.asn1.toDer(asn1);
      const signature = Buffer.from(der.getBytes(), 'binary');

      logger.info('Signature created successfully');
      return signature;
    } catch (error: any) {
      logger.error('Failed to sign manifest', error);
      throw new ApiError(
        ErrorCode.SIGNING_ERROR,
        `Failed to sign manifest: ${error.message}`,
        500
      );
    }
  }

  /**
   * Verify if certificates are valid and properly configured
   */
  public async verifyCertificates(): Promise<boolean> {
    try {
      if (!this.certificateData) {
        await this.loadCertificates();
      }

      if (!this.certificateData) {
        return false;
      }

      const { cert } = this.certificateData;

      // Check certificate validity dates
      const now = new Date();
      const notBefore = cert.validity.notBefore;
      const notAfter = cert.validity.notAfter;

      if (now < notBefore || now > notAfter) {
        logger.error('Certificate is expired or not yet valid');
        return false;
      }

      // Check if certificate has the correct Pass Type ID
      const passTypeId = this.extractPassTypeId(cert);
      if (passTypeId !== config.certificates.passTypeId) {
        logger.error(`Certificate Pass Type ID mismatch. Expected: ${config.certificates.passTypeId}, Got: ${passTypeId}`);
        return false;
      }

      logger.info('Certificates verified successfully');
      return true;
    } catch (error: any) {
      logger.error('Certificate verification failed', error);
      return false;
    }
  }

  /**
   * Extract Pass Type ID from certificate
   */
  private extractPassTypeId(cert: any): string | null {
    try {
      // Look for the Pass Type ID in certificate extensions
      const extensions = cert.extensions || [];
      
      for (const ext of extensions) {
        // Pass Type ID is typically in the Subject Alternative Name or a custom extension
        if (ext.name === 'subjectAltName') {
          const altNames = ext.altNames || [];
          for (const altName of altNames) {
            if (altName.value && altName.value.includes('pass.')) {
              return altName.value;
            }
          }
        }
      }

      // Also check the certificate subject
      const subject = cert.subject.attributes || [];
      for (const attr of subject) {
        if (attr.value && attr.value.includes('pass.')) {
          return attr.value;
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get certificate expiration date
   */
  public async getCertificateExpiration(): Promise<Date | null> {
    try {
      if (!this.certificateData) {
        await this.loadCertificates();
      }

      if (!this.certificateData) {
        return null;
      }

      return this.certificateData.cert.validity.notAfter;
    } catch {
      return null;
    }
  }
}