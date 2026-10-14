// Capa de acceso a datos del comparador y la lista de deseos: aquí vive todo el SQL.

import { consultar } from '../shared/db.mjs';

export const repositorioCatalogo = {
  async listarComparador() {
    const filas = await consultar('SELECT producto_id FROM comparador ORDER BY agregado_en, producto_id');
    return filas.map((f) => f.producto_id);
  },
  agregarAlComparador(idProducto) {
    return consultar('INSERT INTO comparador (producto_id) VALUES (?)', [idProducto]);
  },
  quitarDelComparador(idProducto) {
    return consultar('DELETE FROM comparador WHERE producto_id = ?', [idProducto]);
  },
  vaciarComparador() {
    return consultar('DELETE FROM comparador');
  },

  async listarDeseos() {
    const filas = await consultar('SELECT producto_id FROM lista_deseos ORDER BY agregado_en, producto_id');
    return filas.map((f) => f.producto_id);
  },
  agregarADeseos(idProducto) {
    return consultar('INSERT INTO lista_deseos (producto_id) VALUES (?)', [idProducto]);
  },
  quitarDeDeseos(idProducto) {
    return consultar('DELETE FROM lista_deseos WHERE producto_id = ?', [idProducto]);
  }
};
