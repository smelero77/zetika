import crypto from 'crypto';

export function computeContentHash(obj: any): string {
  const json = JSON.stringify(obj, Object.keys(obj).sort());
  return crypto.createHash('sha256').update(json).digest('hex');
} 