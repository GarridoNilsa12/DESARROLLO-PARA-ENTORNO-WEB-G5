const http = require('node:http');
const { categorias, productos } = require('./data/productos');

const PORT = process.env.PORT || 3000;
const MAX_COMPARAR = 3;

// Datos en memoria: se reinician al apagar el servidor
let comparador = [];
let deseos = [1, 4, 10]; // MacBook, iPad y Logitech G733 de ejemplo

class ErrorApi extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

function aProductoApi(producto) {
  const categoria = categorias.find((c) => c.id === producto.idCategoria);
  return {
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    idCategoria: producto.idCategoria,
    categoria: categoria.nombre,
    icono: categoria.icono,
  };
}

function buscarProducto(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) {
    throw new ErrorApi(404, `No existe el producto ${id}`);
  }
  return producto;
}

// Arma la tabla de comparación con los productos que están en el comparador
function resultadoComparacion() {
  const elegidos = comparador.map(buscarProducto);

  // Une las características de todos los productos, respetando el orden en que aparecen
  const nombres = [...new Set(elegidos.flatMap((p) => Object.keys(p.specs)))];
  const caracteristicas = nombres.map((nombre) => {
    const valores = elegidos.map((p) => p.specs[nombre] ?? null);
    return {
      nombre,
      valores,
      esDiferente: elegidos.length > 1 && new Set(valores).size > 1,
    };
  });

  return {
    categoria: elegidos.length > 0 ? aProductoApi(elegidos[0]).categoria : null,
    productos: elegidos.map((p) => ({ ...aProductoApi(p), specs: p.specs })),
    caracteristicas,
  };
}

function agregarAlComparador(idProducto) {
  if (!Number.isInteger(idProducto)) {
    throw new ErrorApi(400, 'Debes enviar un idProducto numérico, ej: { "idProducto": 1 }');
  }

  const producto = buscarProducto(idProducto);

  if (comparador.includes(idProducto)) {
    throw new ErrorApi(409, 'El producto ya está en el comparador');
  }
  if (comparador.length >= MAX_COMPARAR) {
    throw new ErrorApi(400, `Solo se pueden comparar hasta ${MAX_COMPARAR} productos`);
  }
  if (comparador.length > 0 && buscarProducto(comparador[0]).idCategoria !== producto.idCategoria) {
    throw new ErrorApi(400, 'Los productos deben ser de la misma categoría');
  }

  comparador.push(idProducto);
}

function quitarDelComparador(idProducto) {
  if (!comparador.includes(idProducto)) {
    throw new ErrorApi(404, 'El producto no está en el comparador');
  }
  comparador = comparador.filter((id) => id !== idProducto);
}

function listaDeseos() {
  return deseos.map((id) => aProductoApi(buscarProducto(id)));
}

function agregarADeseos(idProducto) {
  if (!Number.isInteger(idProducto)) {
    throw new ErrorApi(400, 'Debes enviar un idProducto numérico, ej: { "idProducto": 1 }');
  }

  buscarProducto(idProducto);

  if (deseos.includes(idProducto)) {
    throw new ErrorApi(409, 'El producto ya está en tu lista de deseos');
  }

  deseos.push(idProducto);
}

function quitarDeDeseos(idProducto) {
  if (!deseos.includes(idProducto)) {
    throw new ErrorApi(404, 'El producto no está en tu lista de deseos');
  }
  deseos = deseos.filter((id) => id !== idProducto);
}

function leerJson(req) {
  return new Promise((resolve, reject) => {
    let cuerpo = '';
    req.on('data', (parte) => (cuerpo += parte));
    req.on('end', () => {
      try {
        resolve(cuerpo ? JSON.parse(cuerpo) : {});
      } catch {
        reject(new ErrorApi(400, 'El cuerpo debe ser un JSON válido'));
      }
    });
    req.on('error', reject);
  });
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function enviarJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...CORS });
  res.end(JSON.stringify(body));
}

async function manejar(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const ruta = url.pathname.replace(/\/$/, '');
  const idEnRuta = ruta.match(/^\/api\/comparador\/(\d+)$/);
  const idDeseo = ruta.match(/^\/api\/deseos\/(\d+)$/);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }

  // GET /api/productos → catálogo para elegir qué comparar
  if (req.method === 'GET' && ruta === '/api/productos') {
    return enviarJson(res, 200, productos.map(aProductoApi));
  }

  // GET /api/comparador → productos en el comparador y su tabla de comparación
  if (req.method === 'GET' && ruta === '/api/comparador') {
    return enviarJson(res, 200, resultadoComparacion());
  }

  // POST /api/comparador  { "idProducto": 1 } → agrega un producto
  if (req.method === 'POST' && ruta === '/api/comparador') {
    const { idProducto } = await leerJson(req);
    agregarAlComparador(idProducto);
    return enviarJson(res, 201, resultadoComparacion());
  }

  // DELETE /api/comparador/:id → quita un producto
  if (req.method === 'DELETE' && idEnRuta) {
    quitarDelComparador(Number(idEnRuta[1]));
    return enviarJson(res, 200, resultadoComparacion());
  }

  // DELETE /api/comparador → vacía el comparador
  if (req.method === 'DELETE' && ruta === '/api/comparador') {
    comparador = [];
    return enviarJson(res, 200, resultadoComparacion());
  }

  // GET /api/deseos → productos guardados en la lista de deseos
  if (req.method === 'GET' && ruta === '/api/deseos') {
    return enviarJson(res, 200, listaDeseos());
  }

  // POST /api/deseos  { "idProducto": 1 } → guarda un producto
  if (req.method === 'POST' && ruta === '/api/deseos') {
    const { idProducto } = await leerJson(req);
    agregarADeseos(idProducto);
    return enviarJson(res, 201, listaDeseos());
  }

  // DELETE /api/deseos/:id → quita un producto de la lista
  if (req.method === 'DELETE' && idDeseo) {
    quitarDeDeseos(Number(idDeseo[1]));
    return enviarJson(res, 200, listaDeseos());
  }

  enviarJson(res, 404, { error: 'Ruta no encontrada' });
}

const server = http.createServer((req, res) => {
  manejar(req, res).catch((err) => {
    if (err instanceof ErrorApi) {
      return enviarJson(res, err.status, { error: err.message });
    }
    console.error(err);
    enviarJson(res, 500, { error: 'Error interno del servidor' });
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso: probablemente la API ya está corriendo en otra terminal.`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}/api`);
});
