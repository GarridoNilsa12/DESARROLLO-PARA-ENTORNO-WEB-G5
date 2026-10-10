// Lambda de reseñas (US003). Capa de entrada: traduce HTTP <-> servicio.
//
// Rutas en API Gateway (ambas apuntan a esta función):
//   GET  /productos/{id}/resenas   -> promedio, distribución y lista de reseñas
//   POST /productos/{id}/resenas   -> publica una reseña (el token de sesión es opcional)
//
// Handler en Lambda:  reviews/handler.handler

import { ErrorHttp, leerEvento, manejarError, respuesta } from '../shared/http.mjs';
import { usuarioDesdeHeaders } from '../shared/jwt.mjs';
import { repositorioResenas } from './repository.mjs';
import { crearServicioResenas } from './service.mjs';

export function crearManejador(servicio) {
  return async function handler(event) {
    try {
      const req = leerEvento(event);

      if (req.metodo === 'OPTIONS') {
        return respuesta(204, null);
      }

      const productoId = req.params.id;

      if (req.metodo === 'GET') {
        return respuesta(200, await servicio.listar(productoId));
      }

      if (req.metodo === 'POST') {
        const usuario = usuarioDesdeHeaders(req.headers);
        if (req.headers.authorization && !usuario) {
          throw new ErrorHttp(401, 'Tu sesión no es válida o venció. Inicia sesión nuevamente.');
        }
        return respuesta(201, await servicio.publicar(productoId, req.cuerpo, usuario));
      }

      throw new ErrorHttp(405, 'Método no permitido.');
    } catch (error) {
      return manejarError(error);
    }
  };
}

export const handler = crearManejador(crearServicioResenas(repositorioResenas));
