// Token firmado (JWT HS256) con módulos propios de Node.js.
// El secreto viene de la variable de entorno JWT_SECRET (una cadena larga y aleatoria).

import { createHmac, timingSafeEqual } from 'node:crypto';

const codificar = (valor) => Buffer.from(JSON.stringify(valor)).toString('base64url');

function firma(datos) {
  const secreto = process.env.JWT_SECRET;
  if (!secreto) {
    throw new Error('Falta la variable de entorno JWT_SECRET');
  }
  return createHmac('sha256', secreto).update(datos).digest('base64url');
}

export function firmarToken(payload, duracionSegundos = 8 * 3600) {
  const ahora = Math.floor(Date.now() / 1000);
  const cabecera = codificar({ alg: 'HS256', typ: 'JWT' });
  const cuerpo = codificar({ ...payload, iat: ahora, exp: ahora + duracionSegundos });
  const datos = `${cabecera}.${cuerpo}`;
  return `${datos}.${firma(datos)}`;
}

/** Devuelve el contenido del token si la firma es válida y no venció; si no, null. */
export function verificarToken(token) {
  if (typeof token !== 'string') return null;

  const partes = token.split('.');
  if (partes.length !== 3) return null;

  const [cabecera, cuerpo, recibida] = partes;
  const esperada = Buffer.from(firma(`${cabecera}.${cuerpo}`));
  const actual = Buffer.from(recibida);
  if (esperada.length !== actual.length || !timingSafeEqual(esperada, actual)) return null;

  try {
    const payload = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8'));
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Lee "Authorization: Bearer <token>" y devuelve el usuario del token, o null. */
export function usuarioDesdeHeaders(headers) {
  const [tipo, token] = String(headers?.authorization ?? '').split(' ');
  if (tipo?.toLowerCase() !== 'bearer' || !token) return null;
  return verificarToken(token);
}
