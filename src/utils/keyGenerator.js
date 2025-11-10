import crypto from 'crypto';

export function generateLicenseKey() {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    const segment = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 5);
    segments.push(segment);
  }
  return segments.join('-');
}
