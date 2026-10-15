// Utilidades comunes para las Lambdas: lectura del evento, respuestas y errores.
// Funciona con API Gateway HTTP API (payload 2.0) y REST API (payload 1.0).

const CORS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

/** Error con código HTTP; el mensaje se devuelve tal cual al frontend. */
export class ErrorHttp extends Error {
  constructor(estado, mensaje) {
    super(mensaje);
    this.estado = estado;
  }
}

export function respuesta(estado, cuerpo) {
  return {
    statusCode: estado,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
    body: cuerpo === null || cuerpo === undefined ? '' : JSON.stringify(cuerpo)
  };
}

/** Convierte el evento de API Gateway en un objeto simple. */
export function leerEvento(event) {
  const metodo = (event.requestContext?.http?.method ?? event.httpMethod ?? '').toUpperCase();
  const ruta = event.rawPath ?? event.path ?? '';

  const headers = {};
  for (const [clave, valor] of Object.entries(event.headers ?? {})) {
    headers[clave.toLowerCase()] = valor;
  }

  let cuerpo = {};
  if (event.body) {
    const texto = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
    try {
      cuerpo = JSON.parse(texto);
    } catch {
      throw new ErrorHttp(400, 'El cuerpo de la solicitud no es un JSON válido.');
    }
    if (typeof cuerpo !== 'object' || cuerpo === null || Array.isArray(cuerpo)) {
      throw new ErrorHttp(400, 'El cuerpo de la solicitud debe ser un objeto JSON.');
    }
  }

  return {
    metodo,
    ruta,
    params: event.pathParameters ?? {},
    query: event.queryStringParameters ?? {},
    headers,
    cuerpo
  };
}

export function manejarError(error) {
  if (error instanceof ErrorHttp) {
    return respuesta(error.estado, { error: error.message });
  }
  console.error(error);
  return respuesta(500, { error: 'Error interno del servidor.' });
}
