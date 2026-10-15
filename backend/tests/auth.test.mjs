import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'secreto-solo-para-pruebas';

const { crearServicioAuth } = await import('../auth/service.mjs');
const { crearManejador } = await import('../auth/handler.mjs');
const { hashear, verificar } = await import('../shared/password.mjs');
const { firmarToken, verificarToken } = await import('../shared/jwt.mjs');

function repositorioFalso() {
  const usuarios = [];
  return {
    usuarios,
    async buscarPorEmail(email) {
      return usuarios.find((u) => u.email === email) ?? null;
    },
    async crear({ nombre, email, passwordHash }) {
      const id = usuarios.length + 1;
      usuarios.push({ id, nombre, email, password_hash: passwordHash });
      return id;
    }
  };
}

// ---------- contraseñas y token ----------

test('hashear no guarda la contraseña en claro y verificar la reconoce', async () => {
  const guardado = await hashear('MiClave123');
  assert.ok(!guardado.includes('MiClave123'));
  assert.equal(await verificar('MiClave123', guardado), true);
  assert.equal(await verificar('otraClave', guardado), false);
  assert.equal(await verificar('x', ''), false);
});

test('dos hashes de la misma contraseña son distintos (sal aleatoria)', async () => {
  assert.notEqual(await hashear('MiClave123'), await hashear('MiClave123'));
});

test('el token se verifica, detecta alteraciones y vence', () => {
  const token = firmarToken({ sub: 1, nombre: 'Luis' });
  assert.equal(verificarToken(token).sub, 1);

  const [c, cuerpo, f] = token.split('.');
  const otro = Buffer.from(JSON.stringify({ sub: 2, exp: 9999999999 })).toString('base64url');
  assert.equal(verificarToken(`${c}.${otro}.${f}`), null);
  assert.equal(verificarToken(`${c}.${cuerpo}.firmafalsa`), null);
  assert.equal(verificarToken('basura'), null);
  assert.equal(verificarToken(undefined), null);

  assert.equal(verificarToken(firmarToken({ sub: 1 }, -10)), null);
});

// ---------- servicio ----------

test('registrar crea la cuenta, normaliza el correo y entrega sesión', async () => {
  const repo = repositorioFalso();
  const servicio = crearServicioAuth(repo);

  const r = await servicio.registrar({ nombre: ' Luis ', email: ' LUIS@Correo.com ', password: 'ClaveSegura1', consentimiento: true });
  assert.deepEqual(r.usuario, { id: 1, nombre: 'Luis', email: 'luis@correo.com' });
  assert.equal(verificarToken(r.token).sub, 1);
  assert.notEqual(repo.usuarios[0].password_hash, 'ClaveSegura1');
});

test('registrar valida nombre, correo y contraseña', async () => {
  const servicio = crearServicioAuth(repositorioFalso());
  await assert.rejects(servicio.registrar({ nombre: 'L', email: 'a@b.com', password: '12345678', consentimiento: true }), { estado: 400 });
  await assert.rejects(servicio.registrar({ nombre: 'Luis', email: 'sin-arroba', password: '12345678', consentimiento: true }), { estado: 400 });
  await assert.rejects(servicio.registrar({ nombre: 'Luis', email: 'a@b.com', password: 'corta', consentimiento: true }), { estado: 400 });
  await assert.rejects(servicio.registrar({}), { estado: 400 });
});

test('registrar exige aceptar el aviso de privacidad', async () => {
  const servicio = crearServicioAuth(repositorioFalso());
  await assert.rejects(
    servicio.registrar({ nombre: 'Luis', email: 'a@b.com', password: '12345678' }),
    { estado: 400 }
  );
  await assert.rejects(
    servicio.registrar({ nombre: 'Luis', email: 'a@b.com', password: '12345678', consentimiento: false }),
    { estado: 400 }
  );
});

test('registrar rechaza correos repetidos con 409', async () => {
  const servicio = crearServicioAuth(repositorioFalso());
  await servicio.registrar({ nombre: 'Luis', email: 'a@b.com', password: '12345678', consentimiento: true });
  await assert.rejects(
    servicio.registrar({ nombre: 'Otro', email: 'A@B.com', password: '87654321', consentimiento: true }),
    { estado: 409 }
  );
});

test('registrar traduce el error de duplicado de MySQL a 409', async () => {
  const repo = repositorioFalso();
  repo.crear = async () => { const e = new Error('dup'); e.code = 'ER_DUP_ENTRY'; throw e; };
  await assert.rejects(
    crearServicioAuth(repo).registrar({ nombre: 'Luis', email: 'a@b.com', password: '12345678', consentimiento: true }),
    { estado: 409 }
  );
});

test('iniciarSesion acepta credenciales correctas y rechaza las incorrectas con el mismo mensaje', async () => {
  const servicio = crearServicioAuth(repositorioFalso());
  await servicio.registrar({ nombre: 'Luis', email: 'a@b.com', password: 'ClaveSegura1', consentimiento: true });

  const ok = await servicio.iniciarSesion({ email: 'A@b.com', password: 'ClaveSegura1', consentimiento: true });
  assert.equal(ok.usuario.email, 'a@b.com');
  assert.ok(ok.token);

  const mal = await servicio.iniciarSesion({ email: 'a@b.com', password: 'incorrecta' }).catch((e) => e);
  const noExiste = await servicio.iniciarSesion({ email: 'x@y.com', password: 'ClaveSegura1', consentimiento: true }).catch((e) => e);
  assert.equal(mal.estado, 401);
  assert.equal(noExiste.estado, 401);
  assert.equal(mal.message, noExiste.message);

  await assert.rejects(servicio.iniciarSesion({ email: '', password: '' }), { estado: 400 });
});

// ---------- handler ----------

test('handler: registro 201, login 200, ruta desconocida 404, método 405, OPTIONS 204', async () => {
  const handler = crearManejador(crearServicioAuth(repositorioFalso()));
  const evento = (metodo, ruta, cuerpo) => ({
    httpMethod: metodo, path: ruta, body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });

  const reg = await handler(evento('POST', '/auth/registro', { nombre: 'Luis', email: 'a@b.com', password: '12345678', consentimiento: true }));
  assert.equal(reg.statusCode, 201);
  assert.ok(JSON.parse(reg.body).token);

  // También funciona con el prefijo de etapa que agrega API Gateway (HTTP API v2)
  const login = await handler({
    requestContext: { http: { method: 'POST' } },
    rawPath: '/prod/auth/login',
    body: JSON.stringify({ email: 'a@b.com', password: '12345678', consentimiento: true })
  });
  assert.equal(login.statusCode, 200);

  assert.equal((await handler(evento('POST', '/auth/otra'))).statusCode, 404);
  assert.equal((await handler(evento('GET', '/auth/login'))).statusCode, 405);
  assert.equal((await handler(evento('OPTIONS', '/auth/login'))).statusCode, 204);

  const mal = await handler(evento('POST', '/auth/login', { email: 'a@b.com', password: 'mala' }));
  assert.equal(mal.statusCode, 401);
  assert.ok(!mal.body.includes('mala'));
});
