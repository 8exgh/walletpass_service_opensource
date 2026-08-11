import crypto from 'crypto';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export function generateSerialNumber(): string {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

export function generatePassId(): string {
  return crypto.randomBytes(8).toString('hex');
}

export async function calculateSHA1(data: Buffer | string): Promise<string> {
  const hash = crypto.createHash('sha1');
  hash.update(data);
  return hash.digest('hex');
}

export async function hashFile(filepath: string): Promise<string> {
  const data = await readFile(filepath);
  return calculateSHA1(data);
}

export function validateHexColor(color: string): boolean {
  const hexColorRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
}

export function normalizeHexColor(color: string): string {
  if (!color) return '';
  
  // Remove # if present
  color = color.replace('#', '');
  
  // Convert 3-digit hex to 6-digit
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  
  return `#${color.toUpperCase()}`;
}

export function generateAuthToken(): string {
  return crypto.randomBytes(32).toString('base64');
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export function compareApiKey(apiKey: string, hashedKey: string): boolean {
  const hash = hashApiKey(apiKey);
  return hash === hashedKey;
}