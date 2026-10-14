# DESARROLLO PARA ENTORNO WEB G5
 Trabajo Parcial

## Cómo ejecutar

Opción rápida: `powershell -ExecutionPolicy Bypass -File .\iniciar.ps1` abre las dos ventanas.

O a mano, en dos terminales:

```bash
# 1. API (puerto 3000) — no requiere npm install
cd backend
npm run dev   # se reinicia sola al cambiar el código

# 2. Frontend Angular (puerto 4200)
cd angular-app
npm install
npm start
```

Abrir http://localhost:4200/comparador. `ng serve` redirige las llamadas a `/api` hacia la API (ver `angular-app/proxy.conf.json`).

### Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/productos` | Lista todos los productos |
| GET | `/api/comparador` | Productos en el comparador y su tabla de comparación |
| POST | `/api/comparador` | Agrega un producto. Body: `{ "idProducto": 1 }` |
| DELETE | `/api/comparador/:id` | Quita un producto del comparador |
| DELETE | `/api/comparador` | Vacía el comparador |
| GET | `/api/deseos` | Productos guardados en la lista de deseos |
| POST | `/api/deseos` | Guarda un producto. Body: `{ "idProducto": 1 }` |
| DELETE | `/api/deseos/:id` | Quita un producto de la lista de deseos |

Las operaciones del comparador responden con la comparación actualizada (reglas: máximo 3 productos, de la misma categoría y sin repetir). Las de la lista de deseos responden con la lista actualizada (no se puede guardar dos veces el mismo producto). Los datos se guardan en memoria: al reiniciar la API, el comparador se vacía y la lista de deseos vuelve a sus 3 productos de ejemplo.

Para probar los endpoints desde VS Code, abre `backend/api.http` con la extensión REST Client.

Ejemplo de respuesta de `GET /api/comparador`:

```json
{
  "categoria": "Laptops",
  "productos": [
    { "id": 1, "nombre": "Apple MacBook Air 13.6\" Chip M5", "precio": 4999, "idCategoria": 1, "categoria": "Laptops", "icono": "💻", "specs": { "RAM": "16 GB" } },
    { "id": 2, "nombre": "DELL Inspiron 15 Intel Core i7", "precio": 2999, "idCategoria": 1, "categoria": "Laptops", "icono": "💻", "specs": { "RAM": "16 GB" } }
  ],
  "caracteristicas": [
    { "nombre": "RAM", "valores": ["16 GB", "16 GB"], "esDiferente": false }
  ]
}
```
