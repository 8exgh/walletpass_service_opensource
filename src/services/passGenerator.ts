import { config } from '../config';
import { PassJson, GeneratePassRequest, Barcode } from '../models/passModels';
import { normalizeHexColor } from '../utils/crypto';
import { logger } from '../utils/logger';

export class PassGenerator {
  /**
   * Generate the pass.json structure for an Apple Wallet pass
   */
  public generatePassJson(request: GeneratePassRequest): PassJson {
    logger.info('Generating pass.json', { serialNumber: request.serialNumber });

    // Create base pass structure
    const passJson: PassJson = {
      formatVersion: 1,
      passTypeIdentifier: config.certificates.passTypeId,
      serialNumber: request.serialNumber,
      teamIdentifier: config.certificates.teamId,
      description: request.metadata.description,
      organizationName: request.metadata.organizationName,
      sharingProhibited: false,
      suppressStripShine: false,
    };

    // Add visual customization
    if (request.visual.foregroundColor) {
      passJson.foregroundColor = this.convertToRGB(request.visual.foregroundColor);
    }
    if (request.visual.backgroundColor) {
      passJson.backgroundColor = this.convertToRGB(request.visual.backgroundColor);
    }
    if (request.visual.labelColor) {
      passJson.labelColor = this.convertToRGB(request.visual.labelColor);
    }
    if (request.visual.logoText) {
      passJson.logoText = request.visual.logoText;
    }

    // Add expiration date if provided
    if (request.metadata.expirationDate) {
      passJson.expirationDate = request.metadata.expirationDate;
    }

    // Add pass fields based on type
    if (request.passType === 'generic') {
      passJson.generic = {
        headerFields: request.data.headerFields || [],
        primaryFields: request.data.primaryFields || [],
        secondaryFields: request.data.secondaryFields || [],
        auxiliaryFields: request.data.auxiliaryFields || [],
        backFields: request.data.backFields || [],
      };
    }

    // Add barcode if provided
    if (request.data.barcode) {
      const barcode: Barcode = {
        format: request.data.barcode.format,
        message: request.data.barcode.message,
        messageEncoding: request.data.barcode.messageEncoding || 'iso-8859-1',
      };

      // Add both barcode and barcodes for compatibility
      passJson.barcode = barcode;
      passJson.barcodes = [barcode];
    }

    // Add web service URL and auth token for future updates (optional)
    // These would be implemented in a production system
    // passJson.webServiceURL = 'https://api.example.com/passes';
    // passJson.authenticationToken = generateAuthToken();

    return passJson;
  }

  /**
   * Convert hex color to RGB format required by Apple Wallet
   * Apple Wallet expects colors in "rgb(r, g, b)" format
   */
  private convertToRGB(hexColor: string): string {
    const normalized = normalizeHexColor(hexColor);
    
    if (!normalized) {
      return 'rgb(0, 0, 0)'; // Default to black
    }

    // Remove # and parse hex values
    const hex = normalized.substring(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Validate pass data before generation
   */
  public validatePassData(request: GeneratePassRequest): string[] {
    const errors: string[] = [];

    // Validate required fields
    if (!request.serialNumber) {
      errors.push('Serial number is required');
    }

    if (!request.metadata?.description) {
      errors.push('Pass description is required');
    }

    if (!request.metadata?.organizationName) {
      errors.push('Organization name is required');
    }

    // Validate colors if provided
    if (request.visual?.foregroundColor && !this.isValidColor(request.visual.foregroundColor)) {
      errors.push('Invalid foreground color format');
    }

    if (request.visual?.backgroundColor && !this.isValidColor(request.visual.backgroundColor)) {
      errors.push('Invalid background color format');
    }

    if (request.visual?.labelColor && !this.isValidColor(request.visual.labelColor)) {
      errors.push('Invalid label color format');
    }

    // Validate barcode if provided
    if (request.data?.barcode) {
      if (!request.data.barcode.message) {
        errors.push('Barcode message is required');
      }

      const validFormats = ['PKBarcodeFormatQR', 'PKBarcodeFormatPDF417', 'PKBarcodeFormatAztec'];
      if (!validFormats.includes(request.data.barcode.format)) {
        errors.push('Invalid barcode format');
      }
    }

    // Validate expiration date format if provided
    if (request.metadata?.expirationDate) {
      const date = new Date(request.metadata.expirationDate);
      if (isNaN(date.getTime())) {
        errors.push('Invalid expiration date format');
      }
    }

    return errors;
  }

  /**
   * Check if a color string is valid
   */
  private isValidColor(color: string): boolean {
    // Accept hex colors with or without #
    const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    
    // Accept rgb format
    const rgbRegex = /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/;
    
    return hexRegex.test(color) || rgbRegex.test(color);
  }
}