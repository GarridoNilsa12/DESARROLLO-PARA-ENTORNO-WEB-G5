import { test } from 'node:test';
import assert from 'node:assert/strict';

const { crearServicioCatalogo } = await import('../catalogo/service.mjs');
const { crearManejador } = await import('../catalogo/handler.mjs');

function repositorioFalso({ comparador = [], deseos = [] } = {}) {
  return {
    comparador, deseos,
    async listarComparador() { return [...this.comparador]; },
    async agregarAlComparador(id) { this.comparador.push(id); },
    async quitarDelComparador(id) { this.comparador = this.comparador.filter((x) => x !== id); },
    async vaciarComparador() { this.comparador = []; },
    async listarDeseos() { return [...this.deseos]; },
    async agregarADeseos(id) { this.deseos.push(id); },
    async quitarDeDeseos(id) { this.deseos = this.deseos.filter((x) => x !== id); }
  };
}

const evento = (metodo, ruta, cuerpo) => ({
  requestContext: { http: { method: metodo } },
  rawPath: ruta,
  body: cuerpo ? JSON.stringify(cuerpo) : undefined
});

// ---------- comparador ----------

test('agregar dos productos de la misma categoría arma la tabla con diferencias', async () => {
  const repo = repositorioFalso();
  const servicio = crearServicioCatalogo(repo);
  await servicio.agregarAlComparador(1);
  const r = await servicio.agregarAlComparador(2);
  assert.equal(r.productos.length, 2);
  assert.equal(r.categoria, 'Laptops');
  assert.equal(r.caracteristicas.find((c) => c.nombre === 'RAM').esDiferente, false);
  assert.equal(r.caracteristicas.find((c) => c.nombre === 'Marca').esDiferente, true);
});

test('el comparador rechaza repetidos, otra categoría y más de 3 productos', async () => {
  const servicio = crearServicioCatalogo(repositorioFalso({ comparador: [1] }));
  await assert.rejects(servicio.agregarAlComparador(1), { estado: 409 });
  await assert.rejects(servicio.agregarAlComparador(4), { estado: 400 }); // tablet, otra categoría
  const lleno = crearServicioCatalogo(repositorioFalso({ comparador: [1, 2, 3] }));
  await assert.rejects(lleno.agregarAlComparador(1), { estado: 409 });
  await assert.rejects(lleno.agregarAlComparador(1 + 3), { estado: 400 });
});

test('quitar y vaciar el comparador', async () => {
  const servicio = crearServicioCatalogo(repositorioFalso({ comparador: [1, 2] }));
  assert.equal((await servicio.quitarDelComparador(1)).productos.length, 1);
  await assert.rejects(servicio.quitarDelComparador(9), { estado: 404 });
  assert.equal((await servicio.vaciarComparador()).productos.length, 0);
});

test('validaciones: idProducto no numérico o inexistente', async () => {
  const servicio = crearServicioCatalogo(repositorioFalso());
  await assert.rejects(servicio.agregarAlComparador('1'), { estado: 400 });
  await assert.rejects(servicio.agregarADeseos(undefined), { estado: 400 });
  await assert.rejects(servicio.agregarADeseos(999), { estado: 404 });
});

// ---------- lista de deseos ----------

test('lista de deseos: agregar, repetido y quitar', async () => {
  const servicio = crearServicioCatalogo(repositorioFalso({ deseos: [1] }));
  const lista = await servicio.agregarADeseos(4);
  assert.deepEqual(lista.map((p) => p.id), [1, 4]);
  await assert.rejects(servicio.agregarADeseos(4), { estado: 409 });
  assert.deepEqual((await servicio.quitarDeDeseos(1)).map((p) => p.id), [4]);
  await assert.rejects(servicio.quitarDeDeseos(1), { estado: 404 });
});

// ---------- handler HTTP ----------

test('handler: rutas, códigos y CORS', async () => {
  const handler = crearManejador(crearServicioCatalogo(repositorioFalso()));
  const productos = await handler(evento('GET', '/productos'));
  assert.equal(productos.statusCode, 200);
  assert.ok(JSON.parse(productos.body).length >= 10);

  const alta = await handler(evento('POST', '/deseos', { idProducto: 4 }));
  assert.equal(alta.statusCode, 201);
  assert.equal(alta.headers['Access-Control-Allow-Origin'], '*');

  const baja = await handler(evento('DELETE', '/deseos/4'));
  assert.equal(baja.statusCode, 200);

  const vacio = await handler(evento('DELETE', '/comparador'));
  assert.equal(vacio.statusCode, 200);

  assert.equal((await handler(evento('DELETE', '/comparador/abc'))).statusCode, 400);
  assert.equal((await handler(evento('PUT', '/deseos'))).statusCode, 404);
  assert.equal((await handler(evento('OPTIONS', '/deseos'))).statusCode, 204);
  assert.equal((await handler(evento('POST', '/comparador', { idProducto: 'x' }))).statusCode, 400);
});
