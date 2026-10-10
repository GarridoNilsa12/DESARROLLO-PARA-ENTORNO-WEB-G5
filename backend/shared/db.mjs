// Conexión a MySQL (RDS o Aurora). Los datos de conexión vienen de variables
// de entorno de la Lambda; nunca se escriben en el código ni en el repositorio.
//
//   DB_HOST, DB_PORT (3306), DB_USER, DB_PASSWORD, DB_NAME (coolbox)

let pool;

async function obtenerPool() {
  if (!pool) {
    // Import dinámico: así los tests de la lógica no necesitan tener mysql2 instalado.
    const { default: mysql } = await import('mysql2/promise');
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'coolbox',
      waitForConnections: true,
      connectionLimit: 2, // en Lambda cada instancia abre pocas conexiones
      charset: 'utf8mb4'
    });
  }
  return pool;
}

/** Ejecuta una consulta con parámetros (?) y devuelve las filas o el resultado del INSERT. */
export async function consultar(sql, parametros = []) {
  const conexion = await obtenerPool();
  const [resultado] = await conexion.execute(sql, parametros);
  return resultado;
}
