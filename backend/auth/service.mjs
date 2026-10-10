// Capa de lógica de negocio: registro e inicio de sesión.

import { ErrorHttp } from '../shared/http.mjs';
import { firmarToken } from '../shared/jwt.mjs';
import { hashear, verificar } from '../shared/password.mjs';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

function sesion(usuario) {
  const datos = { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
  return {
    usuario: datos,
    token: firmarToken({ sub: datos.id, nombre: datos.nombre, email: datos.email })
  };
}

export function crearServicioAuth(repositorio) {
  return {
    async registrar(datos) {
      const nombre = texto(datos?.nombre);
      const email = texto(datos?.email).toLowerCase();
      const password = typeof datos?.password === 'string' ? datos.password : '';

      if (nombre.length < 2 || nombre.length > 80) {
        throw new ErrorHttp(400, 'Escribe tu nombre (entre 2 y 80 caracteres).');
      }
      if (!EMAIL_VALIDO.test(email) || email.length > 120) {
        throw new ErrorHttp(400, 'Escribe un correo electrónico válido.');
      }
      if (password.length < 8 || password.length > 128) {
        throw new ErrorHttp(400, 'La contraseña debe tener entre 8 y 128 caracteres.');
      }

      if (await repositorio.buscarPorEmail(email)) {
        throw new ErrorHttp(409, 'Ya existe una cuenta con ese correo.');
      }

      let id;
      try {
        id = await repositorio.crear({ nombre, email, passwordHash: await hashear(password) });
      } catch (error) {
        // Dos registros simultáneos con el mismo correo: lo frena el índice UNIQUE de la base.
        if (error?.code === 'ER_DUP_ENTRY') {
          throw new ErrorHttp(409, 'Ya existe una cuenta con ese correo.');
        }
        throw error;
      }

      return sesion({ id, nombre, email });
    },

    async iniciarSesion(datos) {
      const email = texto(datos?.email).toLowerCase();
      const password = typeof datos?.password === 'string' ? datos.password : '';

      if (!email || !password) {
        throw new ErrorHttp(400, 'Escribe tu correo y tu contraseña.');
      }

      const usuario = await repositorio.buscarPorEmail(email);
      // Mismo mensaje para "no existe" y "contraseña incorrecta": no revela qué correos tienen cuenta.
      if (!usuario || !(await verificar(password, usuario.password_hash))) {
        throw new ErrorHttp(401, 'Correo o contraseña incorrectos.');
      }

      return sesion(usuario);
    }
  };
}
