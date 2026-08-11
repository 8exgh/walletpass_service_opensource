// Apple Wallet Pass Models and Interfaces

export interface PassField {
  key: string;
  label: string;
  value: string;
  textAlignment?: 'PKTextAlignmentLeft' | 'PKTextAlignmentCenter' | 'PKTextAlignmentRight' | 'PKTextAlignmentNatural';
  changeMessage?: string;
  dateStyle?: 'PKDateStyleNone' | 'PKDateStyleShort' | 'PKDateStyleMedium' | 'PKDateStyleLong' | 'PKDateStyleFull';
  timeStyle?: 'PKDateStyleNone' | 'PKDateStyleShort' | 'PKDateStyleMedium' | 'PKDateStyleLong' | 'PKDateStyleFull';
  isRelative?: boolean;
  currencyCode?: string;
  numberStyle?: 'PKNumberStyleDecimal' | 'PKNumberStylePercent' | 'PKNumberStyleScientific' | 'PKNumberStyleSpellOut';
}

export interface Barcode {
  format: 'PKBarcodeFormatQR' | 'PKBarcodeFormatPDF417' | 'PKBarcodeFormatAztec' | 'PKBarcodeFormatCode128';
  message: string;
  messageEncoding: string;
  altText?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  relevantText?: string;
  maxDistance?: number;
}

export interface PassJson {
  formatVersion: 1;
  passTypeIdentifier: string;
  serialNumber: string;
  teamIdentifier: string;
  description: string;
  organizationName: string;
  foregroundColor?: string;
  backgroundColor?: string;
  labelColor?: string;
  logoText?: string;
  webServiceURL?: string;
  authenticationToken?: string;
  sharingProhibited?: boolean;
  suppressStripShine?: boolean;
  voided?: boolean;
  expirationDate?: string;
  relevantDate?: string;
  locations?: Location[];
  maxDistance?: number;
  associatedStoreIdentifiers?: number[];
  appLaunchURL?: string;
  userInfo?: any;
  generic?: {
    headerFields?: PassField[];
    primaryFields?: PassField[];
    secondaryFields?: PassField[];
    auxiliaryFields?: PassField[];
    backFields?: PassField[];
  };
  barcode?: Barcode;
  barcodes?: Barcode[];
  nfc?: {
    message: string;
    encryptionPublicKey?: string;
  };
}

// API Request/Response Models

export interface GeneratePassRequest {
  passType: 'generic' | 'boardingPass' | 'coupon' | 'eventTicket' | 'storeCard';
  serialNumber: string;
  data: {
    headerFields?: PassField[];
    primaryFields?: PassField[];
    secondaryFields?: PassField[];
    auxiliaryFields?: PassField[];
    backFields?: PassField[];
    barcode?: {
      format: 'PKBarcodeFormatQR' | 'PKBarcodeFormatPDF417' | 'PKBarcodeFormatAztec';
      message: string;
      messageEncoding: string;
    };
  };
  visual: {
    foregroundColor?: string;
    backgroundColor?: string;
    labelColor?: string;
    logoText?: string;
  };
  metadata: {
    description: string;
    organizationName: string;
    expirationDate?: string;
  };
}

export interface GeneratePassResponse {
  success: boolean;
  data?: {
    passUrl: string;
    passId: string;
    serialNumber: string;
    expiresAt: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface PassMetadata {
  id: string;
  serialNumber: string;
  createdAt: Date;
  expiresAt: Date;
  filename: string;
}

// Error types
export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  CERT_ERROR = 'CERT_ERROR',
  SIGNING_ERROR = 'SIGNING_ERROR',
  GENERATION_ERROR = 'GENERATION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}