import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { config } from '../config';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

export async function saveFile(filepath: string, data: Buffer | string): Promise<void> {
  const dir = path.dirname(filepath);
  await ensureDirectoryExists(dir);
  await writeFile(filepath, data);
}

export async function loadFile(filepath: string): Promise<Buffer> {
  return readFile(filepath);
}

export async function deleteFile(filepath: string): Promise<void> {
  try {
    await unlink(filepath);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function cleanupExpiredPasses(): Promise<void> {
  const passesDir = config.storage.passesDir;
  const ttl = config.storage.ttl * 1000; // Convert to milliseconds
  const now = Date.now();

  try {
    const files = await readdir(passesDir);
    
    for (const file of files) {
      if (file.endsWith('.pkpass')) {
        const filepath = path.join(passesDir, file);
        const stats = await stat(filepath);
        const age = now - stats.mtime.getTime();
        
        if (age > ttl) {
          await deleteFile(filepath);
        }
      }
    }
  } catch (error) {
    // Directory might not exist yet
    if ((error as any).code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function fileExists(filepath: string): Promise<boolean> {
  try {
    await stat(filepath);
    return true;
  } catch {
    return false;
  }
}

export function getTempFilePath(filename: string): string {
  return path.join(config.storage.tempDir, filename);
}

export function getPassFilePath(filename: string): string {
  return path.join(config.storage.passesDir, filename);
}

export async function loadImageAssets(): Promise<Map<string, Buffer>> {
  const assetsDir = config.paths.assets;
  const images = new Map<string, Buffer>();
  
  const imageFiles = [
    'icon.png',
    'icon@2x.png',
    'icon@3x.png',
    'logo.png',
    'logo@2x.png',
    'logo@3x.png',
    'strip.png',
    'strip@2x.png',
    'strip@3x.png',
    'background.png',
    'background@2x.png',
    'thumbnail.png',
    'thumbnail@2x.png',
  ];

  for (const file of imageFiles) {
    const filepath = path.join(assetsDir, file);
    if (await fileExists(filepath)) {
      images.set(file, await loadFile(filepath));
    }
  }

  return images;
}