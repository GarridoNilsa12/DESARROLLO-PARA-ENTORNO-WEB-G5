// Contraseñas con scrypt (incluido en Node.js, sin dependencias nativas).
// Se guarda "sal:hash" en hexadecimal; la contraseña original nunca se almacena.

import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const LONGITUD_HASH = 64;

export async function hashear(password) {
  const sal = randomBytes(16);
  const hash = await scryptAsync(password, sal, LONGITUD_HASH);
  return `${sal.toString('hex')}:${hash.toString('hex')}`;
}

export async function verificar(password, guardado) {
  const [salHex, hashHex] = String(guardado ?? '').split(':');
  if (!salHex || !hashHex) return false;

  const esperado = Buffer.from(hashHex, 'hex');
  const calculado = await scryptAsync(password, Buffer.from(salHex, 'hex'), esperado.length);
  return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}
