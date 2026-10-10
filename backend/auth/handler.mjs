// Lambda de autenticación. Capa de entrada: traduce HTTP <-> servicio.
//
// Rutas en API Gateway (ambas apuntan a esta función):
//   POST /auth/registro   { nombre, email, password }  -> 201 { usuario, token }
//   POST /auth/login      { email, password }          -> 200 { usuario, token }
//
// Handler en Lambda:  auth/handler.handler

import { ErrorHttp, leerEvento, manejarError, respuesta } from '../shared/http.mjs';
import { repositorioUsuarios } from './repository.mjs';
import { crearServicioAuth } from './service.mjs';

export function crearManejador(servicio) {
  return async function handler(event) {
    try {
      const req = leerEvento(event);

      if (req.metodo === 'OPTIONS') {
        return respuesta(204, null);
      }
      if (req.metodo !== 'POST') {
        throw new ErrorHttp(405, 'Método no permitido.');
      }

      if (req.ruta.endsWith('/auth/registro')) {
        return respuesta(201, await servicio.registrar(req.cuerpo));
      }
      if (req.ruta.endsWith('/auth/login')) {
        return respuesta(200, await servicio.iniciarSesion(req.cuerpo));
      }

      throw new ErrorHttp(404, 'Ruta no encontrada.');
    } catch (error) {
      return manejarError(error);
    }
  };
}

export const handler = crearManejador(crearServicioAuth(repositorioUsuarios));
