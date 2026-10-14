// Lambda del catálogo, comparador (US001) y lista de deseos (US004). Capa de entrada: HTTP <-> servicio.
//
// Rutas en API Gateway (todas apuntan a esta función):
//   GET    /productos            -> catálogo para elegir qué comparar o guardar
//   GET    /comparador           -> productos en el comparador y su tabla de comparación
//   POST   /comparador           -> { idProducto } agrega un producto
//   DELETE /comparador           -> vacía el comparador
//   DELETE /comparador/{id}      -> quita un producto
//   GET    /deseos               -> lista de deseos
//   POST   /deseos               -> { idProducto } guarda un producto
//   DELETE /deseos/{id}          -> quita un producto de la lista
//
// Handler en Lambda:  catalogo/handler.handler

import { ErrorHttp, leerEvento, manejarError, respuesta } from '../shared/http.mjs';
import { repositorioCatalogo } from './repository.mjs';
import { crearServicioCatalogo } from './service.mjs';

export function crearManejador(servicio) {
  return async function handler(event) {
    try {
      const req = leerEvento(event);
      if (req.metodo === 'OPTIONS') return respuesta(204, null);

      // /comparador/5 -> recurso "comparador", id 5
      const [recurso, idTexto] = req.ruta.replace(/^\/|\/$/g, '').split('/');
      const id = idTexto === undefined ? undefined : Number(idTexto);
      if (idTexto !== undefined && !Number.isInteger(id)) {
        throw new ErrorHttp(400, 'El id del producto debe ser numérico.');
      }
      const { metodo } = req;

      if (recurso === 'productos' && metodo === 'GET' && id === undefined) {
        return respuesta(200, await servicio.listarProductos());
      }
      if (recurso === 'comparador') {
        if (metodo === 'GET' && id === undefined) return respuesta(200, await servicio.verComparador());
        if (metodo === 'POST' && id === undefined) {
          return respuesta(201, await servicio.agregarAlComparador(req.cuerpo.idProducto));
        }
        if (metodo === 'DELETE') {
          return respuesta(200, id === undefined
            ? await servicio.vaciarComparador()
            : await servicio.quitarDelComparador(id));
        }
      }
      if (recurso === 'deseos') {
        if (metodo === 'GET' && id === undefined) return respuesta(200, await servicio.verDeseos());
        if (metodo === 'POST' && id === undefined) {
          return respuesta(201, await servicio.agregarADeseos(req.cuerpo.idProducto));
        }
        if (metodo === 'DELETE' && id !== undefined) {
          return respuesta(200, await servicio.quitarDeDeseos(id));
        }
      }

      throw new ErrorHttp(404, 'Ruta no encontrada.');
    } catch (error) {
      return manejarError(error);
    }
  };
}

export const handler = crearManejador(crearServicioCatalogo(repositorioCatalogo));
