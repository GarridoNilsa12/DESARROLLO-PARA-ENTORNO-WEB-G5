# API CoolBox: rutas para crear en AWS

Esta guía describe las rutas que el frontend Angular espera. Si la API en AWS respeta estas rutas, bodies y respuestas, la página funciona sin cambios. Solo hay que cambiar la URL base.

La misma definición está en [`backend/openapi.yaml`](../backend/openapi.yaml), que API Gateway puede importar directamente (ver [Importar en API Gateway](#importar-en-api-gateway)).

## Resumen

| # | Método | Ruta | Body | Respuesta OK |
| --- | --- | --- | --- | --- |
| 1 | GET | `/api/productos` | — | `200` lista de productos |
| 2 | GET | `/api/comparador` | — | `200` comparación |
| 3 | POST | `/api/comparador` | `{ "idProducto": 1 }` | `201` comparación |
| 4 | DELETE | `/api/comparador/{id}` | — | `200` comparación |
| 5 | DELETE | `/api/comparador` | — | `200` comparación vacía |
| 6 | GET | `/api/deseos` | — | `200` lista de productos |
| 7 | POST | `/api/deseos` | `{ "idProducto": 1 }` | `201` lista de productos |
| 8 | DELETE | `/api/deseos/{id}` | — | `200` lista de productos |

Estructura de recursos en API Gateway:

```
/api
├── /productos          GET
├── /comparador         GET, POST, DELETE
│   └── /{id}           DELETE
└── /deseos             GET, POST
    └── /{id}           DELETE
```

Todas las respuestas son JSON (`Content-Type: application/json`). Todos los errores tienen la misma forma:

```json
{ "error": "Mensaje para mostrar al usuario" }
```

---

## Productos

### 1. `GET /api/productos`

Devuelve el catálogo completo.

**Respuesta `200`:**

```json
[
  {
    "id": 1,
    "nombre": "Apple MacBook Air 13.6\" Chip M5",
    "precio": 4999,
    "idCategoria": 1,
    "categoria": "Laptops",
    "icono": "💻"
  },
  {
    "id": 4,
    "nombre": "Apple iPad 11\" Wi-Fi 128GB",
    "precio": 1449,
    "idCategoria": 2,
    "categoria": "Tablets",
    "icono": "📱"
  }
]
```

---

## Comparador

Las operaciones del comparador **siempre devuelven la comparación completa actualizada**, con esta forma:

```json
{
  "categoria": "Laptops",
  "productos": [
    {
      "id": 1,
      "nombre": "Apple MacBook Air 13.6\" Chip M5",
      "precio": 4999,
      "idCategoria": 1,
      "categoria": "Laptops",
      "icono": "💻",
      "specs": { "Procesador": "Chip M5", "RAM": "16 GB", "Pantalla": "13.6\"" }
    },
    {
      "id": 2,
      "nombre": "DELL Inspiron 15 Intel Core i7",
      "precio": 2999,
      "idCategoria": 1,
      "categoria": "Laptops",
      "icono": "💻",
      "specs": { "Procesador": "Intel Core i7", "RAM": "16 GB", "Pantalla": "15\"" }
    }
  ],
  "caracteristicas": [
    { "nombre": "Procesador", "valores": ["Chip M5", "Intel Core i7"], "esDiferente": true },
    { "nombre": "RAM",        "valores": ["16 GB", "16 GB"],           "esDiferente": false },
    { "nombre": "Pantalla",   "valores": ["13.6\"", "15\""],           "esDiferente": true }
  ]
}
```

Cómo se arma `caracteristicas`:
- Es la unión de todas las claves de `specs` de los productos, en el orden en que aparecen.
- `valores` tiene un valor por producto, en el mismo orden que `productos`. Si un producto no tiene esa característica, el valor es `null`.
- `esDiferente` es `true` cuando hay más de un producto y no todos los valores son iguales.

Cuando el comparador está vacío, la respuesta es:

```json
{ "categoria": null, "productos": [], "caracteristicas": [] }
```

### 2. `GET /api/comparador`

Devuelve la comparación actual. **Respuesta `200`:** la comparación.

### 3. `POST /api/comparador`

Agrega un producto al comparador.

**Body:**

```json
{ "idProducto": 1 }
```

| Código | Cuándo | Respuesta |
| --- | --- | --- |
| `201` | Se agregó | La comparación actualizada |
| `400` | Falta `idProducto` o no es un número | `{ "error": "Debes enviar un idProducto numérico, ej: { \"idProducto\": 1 }" }` |
| `400` | El body no es JSON válido | `{ "error": "El cuerpo debe ser un JSON válido" }` |
| `400` | Ya hay 3 productos | `{ "error": "Solo se pueden comparar hasta 3 productos" }` |
| `400` | Es de otra categoría que los ya agregados | `{ "error": "Los productos deben ser de la misma categoría" }` |
| `404` | El producto no existe | `{ "error": "No existe el producto 99" }` |
| `409` | Ya está en el comparador | `{ "error": "El producto ya está en el comparador" }` |

### 4. `DELETE /api/comparador/{id}`

Quita un producto del comparador. `{id}` es el id del producto, por ejemplo `DELETE /api/comparador/2`.

| Código | Cuándo | Respuesta |
| --- | --- | --- |
| `200` | Se quitó | La comparación actualizada |
| `404` | No estaba en el comparador | `{ "error": "El producto no está en el comparador" }` |

### 5. `DELETE /api/comparador`

Vacía el comparador. **Respuesta `200`:** la comparación vacía.

---

## Lista de deseos

Las operaciones de la lista de deseos **siempre devuelven la lista completa actualizada**: un arreglo de productos con la misma forma que `GET /api/productos`.

### 6. `GET /api/deseos`

**Respuesta `200`:**

```json
[
  {
    "id": 1,
    "nombre": "Apple MacBook Air 13.6\" Chip M5",
    "precio": 4999,
    "idCategoria": 1,
    "categoria": "Laptops",
    "icono": "💻"
  }
]
```

### 7. `POST /api/deseos`

Guarda un producto en la lista.

**Body:**

```json
{ "idProducto": 2 }
```

| Código | Cuándo | Respuesta |
| --- | --- | --- |
| `201` | Se guardó | La lista actualizada |
| `400` | Falta `idProducto` o no es un número | `{ "error": "Debes enviar un idProducto numérico, ej: { \"idProducto\": 1 }" }` |
| `404` | El producto no existe | `{ "error": "No existe el producto 99" }` |
| `409` | Ya estaba en la lista | `{ "error": "El producto ya está en tu lista de deseos" }` |

### 8. `DELETE /api/deseos/{id}`

Quita un producto de la lista, por ejemplo `DELETE /api/deseos/2`.

| Código | Cuándo | Respuesta |
| --- | --- | --- |
| `200` | Se quitó | La lista actualizada |
| `404` | No estaba en la lista | `{ "error": "El producto no está en tu lista de deseos" }` |

---

## Importar en API Gateway

1. En la consola de AWS, ve a **API Gateway → Create API → REST API → Build**.
2. Elige **Import from OpenAPI** y pega el contenido de [`backend/openapi.yaml`](../backend/openapi.yaml). Se crean todos los recursos y métodos de la tabla.
3. En cada método, configura la integración: **Integration type: Lambda function** y activa **Lambda proxy integration**.
4. Habilita **CORS** en cada recurso (botón *Enable CORS*):
   - Access-Control-Allow-Origin: `*`, o el dominio del frontend
   - Access-Control-Allow-Methods: `GET, POST, DELETE, OPTIONS`
   - Access-Control-Allow-Headers: `Content-Type`
5. **Deploy API** en una etapa (por ejemplo `prod`). La URL queda así:
   `https://<id>.execute-api.<region>.amazonaws.com/prod/api/...`

### Qué recibe y qué devuelve la Lambda (proxy integration)

```js
// Lo que llega en el evento
event.httpMethod             // "POST"
event.pathParameters?.id     // "2" (string) en las rutas /{id}
JSON.parse(event.body)       // { idProducto: 1 } en los POST

// Lo que debe devolver
return {
  statusCode: 201,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // obligatorio con proxy integration, aunque CORS esté habilitado
  },
  body: JSON.stringify(resultado),
};
```

### Datos

Hoy el backend local guarda el comparador y los deseos en memoria. En Lambda eso no funciona, porque cada llamada puede ejecutarse en una instancia distinta. Hay que usar una base de datos, por ejemplo DynamoDB:

| Tabla | Clave de partición | Contenido |
| --- | --- | --- |
| `Productos` | `id` (Number) | Catálogo con `specs` (copiar de [`backend/data/productos.js`](../backend/data/productos.js)) |
| `Comparador` | `idProducto` (Number) | Productos agregados al comparador, en orden (guardar también `fechaAgregado`) |
| `Deseos` | `idProducto` (Number) | Productos guardados en la lista de deseos |

## Conectar el frontend

Cuando la API esté desplegada, en los servicios de Angular ([`comparador.service.ts`](../angular-app/src/app/services/comparador.service.ts) y [`deseos.service.ts`](../angular-app/src/app/services/deseos.service.ts)) reemplaza:

```ts
private apiUrl = '/api';
```

por la URL de API Gateway:

```ts
private apiUrl = 'https://<id>.execute-api.<region>.amazonaws.com/prod/api';
```
