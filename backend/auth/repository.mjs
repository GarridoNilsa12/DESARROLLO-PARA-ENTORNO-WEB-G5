// Capa de acceso a datos de usuarios.

import { consultar } from '../shared/db.mjs';

export const repositorioUsuarios = {
  async buscarPorEmail(email) {
    const filas = await consultar(
      'SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ?',
      [email]
    );
    return filas[0] ?? null;
  },

  async crear({ nombre, email, passwordHash }) {
    const resultado = await consultar(
      'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)',
      [nombre, email, passwordHash]
    );
    return resultado.insertId;
  }
};
