import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'secreto-solo-para-pruebas';

const { crearServicioResenas, resumir } = await import('../reviews/service.mjs');
const { crearManejador } = await import('../reviews/handler.mjs');
const { firmarToken } = await import('../shared/jwt.mjs');

function repositorioFalso(filas = []) {
  const creadas = [];
  return {
    creadas,
    async productoExiste(id) { return id === 1; },
    async listarPorProducto() { return filas; },
    async crear(datos) { creadas.push(datos); return 99; }
  };
}

const fila = (id, calificacion, extra = {}) => ({
  id, nombre: `Cliente ${id}`, calificacion, comentario: 'ok', verificada: 0,
  creadoEn: new Date('2026-10-01T10:00:00Z'), ...extra
});

// ---------- servicio ----------

test('resumir calcula promedio con 1 decimal y la distribución por estrellas', () => {
  const r = resumir([{ calificacion: 5 }, { calificacion: 4 }, { calificacion: 3 }]);
  assert.equal(r.total, 3);
  assert.equal(r.promedio, 4);
  assert.deepEqual(r.distribucion, { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1 });
  assert.equal(resumir([]).promedio, 0);
  assert.equal(resumir([{ calificacion: 5 }, { calificacion: 4 }]).promedio, 4.5);
});

test('listar devuelve resumen y reseñas con el formato esperado', async () => {
  const servicio = crearServicioResenas(repositorioFalso([fila(1, 5, { verificada: 1 }), fila(2, 3)]));
  const r = await servicio.listar('1');
  assert.equal(r.productoId, 1);
  assert.equal(r.total, 2);
  assert.equal(r.promedio, 4);
  assert.equal(r.resenas[0].verificada, true);
  assert.equal(r.resenas[1].verificada, false);
  assert.equal(r.resenas[0].creadoEn, '2026-10-01T10:00:00.000Z');
});

test('listar: producto inexistente da 404 y un id inválido da 400', async () => {
  const servicio = crearServicioResenas(repositorioFalso());
  await assert.rejects(servicio.listar('7'), { estado: 404 });
  await assert.rejects(servicio.listar('abc'), { estado: 400 });
  await assert.rejects(servicio.listar('-3'), { estado: 400 });
});

test('publicar exige calificación y comentario (criterio de aceptación de US003)', async () => {
  const repo = repositorioFalso();
  const servicio = crearServicioResenas(repo);
  const mensaje = 'Elige una calificación y escribe tu comentario.';

  await assert.rejects(servicio.publicar('1', { comentario: 'Bueno' }), { estado: 400, message: mensaje });
  await assert.rejects(servicio.publicar('1', { calificacion: 5, comentario: '   ' }), { estado: 400, message: mensaje });
  await assert.rejects(servicio.publicar('1', { calificacion: 0, comentario: 'x' }), { estado: 400 });
  await assert.rejects(servicio.publicar('1', { calificacion: 6, comentario: 'x' }), { estado: 400 });
  await assert.rejects(servicio.publicar('1', { calificacion: '5', comentario: 'x' }), { estado: 400 });
  assert.equal(repo.creadas.length, 0);
});

test('publicar sin sesión usa el nombre escrito o "Anónimo"', async () => {
  const repo = repositorioFalso();
  const servicio = crearServicioResenas(repo);

  const a = await servicio.publicar('1', { calificacion: 4, comentario: ' Muy bueno ', nombre: ' Luis ' }, null);
  assert.equal(a.nombre, 'Luis');
  assert.equal(a.comentario, 'Muy bueno');
  assert.equal(a.id, 99);

  const b = await servicio.publicar('1', { calificacion: 4, comentario: 'Bien' }, null);
  assert.equal(b.nombre, 'Anónimo');
  assert.equal(repo.creadas[0].usuarioId, null);
});

test('publicar con sesión usa el nombre y el id del usuario del token', async () => {
  const repo = repositorioFalso();
  const servicio = crearServicioResenas(repo);
  await servicio.publicar('1', { calificacion: 5, comentario: 'Genial', nombre: 'Otro' }, { sub: 7, nombre: 'Ana' });
  assert.equal(repo.creadas[0].usuarioId, 7);
  assert.equal(repo.creadas[0].nombreAutor, 'Ana');
});

test('publicar rechaza comentarios demasiado largos y productos inexistentes', async () => {
  const servicio = crearServicioResenas(repositorioFalso());
  await assert.rejects(servicio.publicar('1', { calificacion: 5, comentario: 'x'.repeat(1001) }), { estado: 400 });
  await assert.rejects(servicio.publicar('5', { calificacion: 5, comentario: 'ok' }), { estado: 404 });
});

// ---------- handler (formato de eventos de API Gateway) ----------

const manejador = crearManejador(crearServicioResenas(repositorioFalso([fila(1, 5)])));

test('handler: evento HTTP API v2 con GET', async () => {
  const r = await manejador({
    requestContext: { http: { method: 'GET' } },
    rawPath: '/productos/1/resenas',
    pathParameters: { id: '1' }
  });
  assert.equal(r.statusCode, 200);
  assert.equal(JSON.parse(r.body).total, 1);
  assert.equal(r.headers['Access-Control-Allow-Origin'], '*');
});

test('handler: evento REST API v1 con POST y cuerpo JSON', async () => {
  const r = await manejador({
    httpMethod: 'POST',
    path: '/productos/1/resenas',
    pathParameters: { id: '1' },
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calificacion: 5, comentario: 'Excelente', nombre: 'Luis' })
  });
  assert.equal(r.statusCode, 201);
  assert.equal(JSON.parse(r.body).nombre, 'Luis');
});

test('handler: OPTIONS responde 204 para CORS', async () => {
  const r = await manejador({ httpMethod: 'OPTIONS', path: '/productos/1/resenas' });
  assert.equal(r.statusCode, 204);
  assert.match(r.headers['Access-Control-Allow-Headers'], /Authorization/);
});

test('handler: JSON inválido da 400, método no soportado da 405, producto inexistente da 404', async () => {
  const malo = await manejador({ httpMethod: 'POST', pathParameters: { id: '1' }, body: '{no es json' });
  assert.equal(malo.statusCode, 400);
  const metodo = await manejador({ httpMethod: 'DELETE', pathParameters: { id: '1' } });
  assert.equal(metodo.statusCode, 405);
  const noExiste = await manejador({ httpMethod: 'GET', pathParameters: { id: '9' } });
  assert.equal(noExiste.statusCode, 404);
});

test('handler: token válido identifica al usuario; token inválido da 401', async () => {
  const token = firmarToken({ sub: 3, nombre: 'Marta', email: 'm@x.com' });
  const ok = await manejador({
    httpMethod: 'POST', pathParameters: { id: '1' },
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ calificacion: 4, comentario: 'Bien' })
  });
  assert.equal(ok.statusCode, 201);
  assert.equal(JSON.parse(ok.body).nombre, 'Marta');

  const invalido = await manejador({
    httpMethod: 'POST', pathParameters: { id: '1' },
    headers: { Authorization: 'Bearer token.falso.aqui' },
    body: JSON.stringify({ calificacion: 4, comentario: 'Bien' })
  });
  assert.equal(invalido.statusCode, 401);
});
