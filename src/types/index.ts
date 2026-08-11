import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
}

export interface FileHash {
  [filename: string]: string;
}

export interface PassBundle {
  passJson: Buffer;
  manifest: Buffer;
  signature: Buffer;
  images: { filename: string; data: Buffer }[];
}

export interface CertificateData {
  cert: any;
  key: any;
  wwdr: string;
}