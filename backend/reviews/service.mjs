// Capa de lógica de negocio de reseñas (US003).
// No conoce HTTP ni SQL: recibe el repositorio por parámetro, por eso se puede probar sin base de datos.

import { ErrorHttp } from '../shared/http.mjs';

const MAX_COMENTARIO = 1000;
const MAX_NOMBRE = 80;

function validarProductoId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorHttp(400, 'El identificador del producto no es válido.');
  }
  return id;
}

function aRespuesta(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    calificacion: Number(fila.calificacion),
    comentario: fila.comentario,
    verificada: Boolean(fila.verificada),
    creadoEn: new Date(fila.creadoEn).toISOString()
  };
}

/** Promedio (1 decimal), total y cantidad de reseñas por estrella. */
export function resumir(resenas) {
  const distribucion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let suma = 0;

  for (const resena of resenas) {
    if (distribucion[resena.calificacion] !== undefined) {
      distribucion[resena.calificacion] += 1;
    }
    suma += resena.calificacion;
  }

  const total = resenas.length;
  const promedio = total ? Math.round((suma / total) * 10) / 10 : 0;
  return { total, promedio, distribucion };
}

export function crearServicioResenas(repositorio) {
  return {
    /** Criterio US003: ver la calificación promedio y los comentarios de otros usuarios. */
    async listar(productoIdCrudo) {
      const productoId = validarProductoId(productoIdCrudo);

      if (!(await repositorio.productoExiste(productoId))) {
        throw new ErrorHttp(404, 'Producto no encontrado.');
      }

      const filas = await repositorio.listarPorProducto(productoId);
      const resenas = filas.map(aRespuesta);
      return { productoId, ...resumir(resenas), resenas };
    },

    /** Criterio US003: sin calificación o sin comentario, no se publica. */
    async publicar(productoIdCrudo, datos, usuario) {
      const productoId = validarProductoId(productoIdCrudo);

      const calificacion = datos?.calificacion;
      const comentario = typeof datos?.comentario === 'string' ? datos.comentario.trim() : '';

      if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5 || !comentario) {
        throw new ErrorHttp(400, 'Elige una calificación y escribe tu comentario.');
      }
      if (comentario.length > MAX_COMENTARIO) {
        throw new ErrorHttp(400, `El comentario no puede superar los ${MAX_COMENTARIO} caracteres.`);
      }

      const nombreIngresado = typeof datos?.nombre === 'string' ? datos.nombre.trim() : '';
      const nombreAutor = (usuario?.nombre || nombreIngresado || 'Anónimo').slice(0, MAX_NOMBRE);

      if (!(await repositorio.productoExiste(productoId))) {
        throw new ErrorHttp(404, 'Producto no encontrado.');
      }

      const id = await repositorio.crear({
        productoId,
        usuarioId: usuario?.sub ?? null,
        nombreAutor,
        calificacion,
        comentario
      });

      return {
        id,
        nombre: nombreAutor,
        calificacion,
        comentario,
        verificada: false,
        creadoEn: new Date().toISOString()
      };
    }
  };
}
