/**
 * URL base de la API (API Gateway), sin "/" al final.
 * Ejemplo: 'https://abc123.execute-api.us-east-1.amazonaws.com'
 *
 * Mientras esté vacía, la app sigue funcionando con los datos de ejemplo que ya tenía
 * (así nadie se queda sin poder probar la pantalla antes de desplegar el backend).
 */
export const API_BASE_URL = 'https://66kifzdyqc.execute-api.us-east-1.amazonaws.com';

/** Producto al que apuntan las reseñas mientras no exista la ficha de producto (id de la tabla productos). */
export const PRODUCTO_DEMO_ID = 1;
