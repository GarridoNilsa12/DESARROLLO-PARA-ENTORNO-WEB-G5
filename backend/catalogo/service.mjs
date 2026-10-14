// Capa de negocio del comparador y la lista de deseos (sin SQL ni HTTP).
// Mismas reglas que el servidor local (server.js), pero guardando en MySQL.

import { createRequire } from 'node:module';
import { ErrorHttp } from '../shared/http.mjs';

const require = createRequire(import.meta.url);
const { categorias, productos: catalogo } = require('../data/productos.js');

export const MAX_COMPARAR = 3;

export function aProductoApi(producto) {
  const categoria = categorias.find((c) => c.id === producto.idCategoria);
  return {
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    idCategoria: producto.idCategoria,
    categoria: categoria.nombre,
    icono: categoria.icono
  };
}

function buscarProducto(id) {
  const producto = catalogo.find((p) => p.id === id);
  if (!producto) throw new ErrorHttp(404, `No existe el producto ${id}`);
  return producto;
}

function validarId(idProducto) {
  if (!Number.isInteger(idProducto)) {
    throw new ErrorHttp(400, 'Debes enviar un idProducto numérico, ej: { "idProducto": 1 }');
  }
}

export function armarComparacion(ids) {
  const elegidos = ids.map(buscarProducto);
  const nombres = [...new Set(elegidos.flatMap((p) => Object.keys(p.specs)))];
  const caracteristicas = nombres.map((nombre) => {
    const valores = elegidos.map((p) => p.specs[nombre] ?? null);
    return { nombre, valores, esDiferente: elegidos.length > 1 && new Set(valores).size > 1 };
  });
  return {
    categoria: elegidos.length > 0 ? aProductoApi(elegidos[0]).categoria : null,
    productos: elegidos.map((p) => ({ ...aProductoApi(p), specs: p.specs })),
    caracteristicas
  };
}

export function crearServicioCatalogo(repo) {
  const comparacion = async () => armarComparacion(await repo.listarComparador());
  const deseos = async () => (await repo.listarDeseos()).map((id) => aProductoApi(buscarProducto(id)));

  return {
    listarProductos: async () => catalogo.map(aProductoApi),

    verComparador: comparacion,

    async agregarAlComparador(idProducto) {
      validarId(idProducto);
      const producto = buscarProducto(idProducto);
      const actuales = await repo.listarComparador();
      if (actuales.includes(idProducto)) throw new ErrorHttp(409, 'El producto ya está en el comparador');
      if (actuales.length >= MAX_COMPARAR) {
        throw new ErrorHttp(400, `Solo se pueden comparar hasta ${MAX_COMPARAR} productos`);
      }
      if (actuales.length > 0 && buscarProducto(actuales[0]).idCategoria !== producto.idCategoria) {
        throw new ErrorHttp(400, 'Los productos deben ser de la misma categoría');
      }
      await repo.agregarAlComparador(idProducto);
      return comparacion();
    },

    async quitarDelComparador(idProducto) {
      validarId(idProducto);
      if (!(await repo.listarComparador()).includes(idProducto)) {
        throw new ErrorHttp(404, 'El producto no está en el comparador');
      }
      await repo.quitarDelComparador(idProducto);
      return comparacion();
    },

    async vaciarComparador() {
      await repo.vaciarComparador();
      return comparacion();
    },

    verDeseos: deseos,

    async agregarADeseos(idProducto) {
      validarId(idProducto);
      buscarProducto(idProducto);
      if ((await repo.listarDeseos()).includes(idProducto)) {
        throw new ErrorHttp(409, 'El producto ya está en tu lista de deseos');
      }
      await repo.agregarADeseos(idProducto);
      return deseos();
    },

    async quitarDeDeseos(idProducto) {
      validarId(idProducto);
      if (!(await repo.listarDeseos()).includes(idProducto)) {
        throw new ErrorHttp(404, 'El producto no está en tu lista de deseos');
      }
      await repo.quitarDeDeseos(idProducto);
      return deseos();
    }
  };
}
