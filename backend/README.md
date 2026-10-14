# Backend de Coolbox

Funciones Lambda en Node.js con base de datos MySQL. Esta entrega cubre las historias de **Luis**:
**US003 Reseñas y calificaciones** y **Registro e inicio de sesión**. Cada integrante agrega su carpeta
(`chat/`, `wishlist/`, ...) siguiendo la misma estructura.

## Estructura (arquitectura en capas)

```
backend/
├── shared/            Código común: conexión a MySQL, respuestas HTTP/CORS, contraseñas, token
├── reviews/           US003
│   ├── handler.mjs    Capa de entrada: recibe el evento de API Gateway y arma la respuesta
│   ├── service.mjs    Capa de negocio: validaciones y reglas (sin SQL ni HTTP)
│   └── repository.mjs Capa de datos: todas las consultas SQL
├── auth/              Registro e inicio de sesión (misma estructura de 3 capas)
└── tests/             Pruebas automáticas (npm test)
```

## Endpoints

| Método | Ruta                          | Función   | Qué hace |
|--------|-------------------------------|-----------|----------|
| GET    | `/productos/{id}/resenas`     | `reviews` | Devuelve promedio, cantidad por estrella y la lista de reseñas |
| POST   | `/productos/{id}/resenas`     | `reviews` | Publica una reseña `{ nombre?, calificacion (1-5), comentario }`. Si se envía `Authorization: Bearer <token>`, queda a nombre del usuario |
| POST   | `/auth/registro`              | `auth`    | `{ nombre, email, password }` → `201 { usuario, token }` |
| POST   | `/auth/login`                 | `auth`    | `{ email, password }` → `200 { usuario, token }` |
| GET    | `/productos`                  | `catalogo`| Catálogo de productos para comparar o guardar |
| GET    | `/comparador`                 | `catalogo`| Productos en el comparador y tabla de comparación (US001) |
| POST   | `/comparador`                 | `catalogo`| `{ idProducto }` agrega un producto (máx. 3, misma categoría) |
| DELETE | `/comparador`, `/comparador/{id}` | `catalogo` | Vacía el comparador o quita un producto |
| GET    | `/deseos`                     | `catalogo`| Lista de deseos (US004) |
| POST   | `/deseos`                     | `catalogo`| `{ idProducto }` guarda un producto |
| DELETE | `/deseos/{id}`                | `catalogo`| Quita un producto de la lista |

Errores: siempre `{ "error": "mensaje" }` con código 400 (datos inválidos), 401 (credenciales o sesión inválidas),
404 (producto inexistente), 405 o 409 (correo repetido).

## Variables de entorno de cada Lambda

| Variable | Valor |
|----------|-------|
| `DB_HOST` | Endpoint de tu RDS/Aurora |
| `DB_PORT` | `3306` |
| `DB_USER`, `DB_PASSWORD` | Usuario de la base (**nunca** en el repositorio) |
| `DB_NAME` | `coolbox` |
| `JWT_SECRET` | Cadena larga y aleatoria (mínimo 32 caracteres). Debe ser la misma en `auth` y `reviews` |
| `ALLOWED_ORIGIN` | (opcional) URL de Amplify, por ejemplo `https://main.xxxx.amplifyapp.com`. Si no se define, acepta cualquier origen |

## Despliegue paso a paso

1. **Base de datos.** Con la instancia MySQL 8 de RDS/Aurora creada, ejecuta en orden
   `database/01_esquema.sql` y `database/02_datos_prueba.sql` (MySQL Workbench o el cliente `mysql`).
2. **Instalar dependencias.** En la carpeta `backend/`: `npm install --omit=dev`
3. **Empaquetar.** Desde `backend/`, en la terminal de Windows (incluye `node_modules`):
   ```
   tar -a -c -f backend.zip auth reviews catalogo data shared node_modules package.json
   ```
   (No uses "Enviar a > Carpeta comprimida" ni `Compress-Archive` de PowerShell 5: guardan las rutas con `\` y Lambda no encuentra los archivos.)
4. **Crear dos funciones Lambda** (runtime Node.js 22.x o 20.x), ambas con el mismo `backend.zip`:
   - `coolbox-reviews` → Handler: `reviews/handler.handler`
   - `coolbox-auth` → Handler: `auth/handler.handler`
   - `coolbox-catalogo` → Handler: `catalogo/handler.handler` (comparador y lista de deseos; antes ejecuta `database/03_comparador_deseos.sql`)

   Timeout 15 s, memoria 256 MB y las variables de entorno de la tabla anterior.
5. **Red.** Pon las Lambdas en la misma VPC que la base de datos y permite el puerto 3306 en el Security Group de
   RDS desde el Security Group de las Lambdas. Estas funciones solo hablan con MySQL, no necesitan salida a internet.
6. **API Gateway (HTTP API).** Crea las 4 rutas de la tabla de endpoints, cada una con su integración Lambda
   (`reviews` para las de `/productos/...` y `auth` para las de `/auth/...`). Activa CORS con el origen de Amplify,
   y los encabezados `content-type` y `authorization`.
7. **Conectar el frontend.** Copia la *Invoke URL* (sin `/` al final) en
   `angular-app/src/app/core/api.config.ts` → `API_BASE_URL`, haz commit y Amplify desplegará solo.

## Probar con Postman o curl

```bash
API=https://TU-API.execute-api.us-east-1.amazonaws.com

curl $API/productos/1/resenas

curl -X POST $API/auth/registro -H "Content-Type: application/json" \
  -d '{"nombre":"Luis","email":"luis@correo.com","password":"ClaveSegura1"}'

curl -X POST $API/productos/1/resenas -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"calificacion":5,"comentario":"Excelente producto"}'
```

## Pruebas automáticas

```
cd backend
npm test
```

Prueban la lógica de reseñas y autenticación, los formatos de evento de API Gateway (HTTP API y REST API), CORS y
los códigos de error, sin necesitar la base de datos.

## Seguridad

- Las contraseñas se guardan con **scrypt** y sal aleatoria; nunca en texto plano.
- Todas las consultas usan parámetros (`?`), no se concatena texto del usuario en el SQL.
- Los datos de conexión y `JWT_SECRET` viven solo en variables de entorno de la Lambda.
- Al terminar las pruebas, apaga o elimina la instancia de RDS para evitar cobros.
