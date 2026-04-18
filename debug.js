import jwt from 'jsonwebtoken';
import fs from 'fs';

const key = fs.readFileSync('./private-key.pem', 'utf8');
console.log('Key length:', key.length);
console.log('First 50 chars:', JSON.stringify(key.substring(0, 50)));
console.log('Last 50 chars:', JSON.stringify(key.substring(key.length - 50)));
console.log('Has BEGIN RSA:', key.includes('BEGIN RSA PRIVATE KEY'));
console.log('Has BEGIN PKCS8:', key.includes('BEGIN PRIVATE KEY'));

try {
  const now = Math.floor(Date.now() / 1000);
  const token = jwt.sign({ iat: now - 60, exp: now + 540, iss: '3419025' }, key, { algorithm: 'RS256' });
  console.log('JWT generated OK:', token.substring(0, 50) + '...');
} catch(e) {
  console.log('JWT ERROR:', e.message);
}