/**
 * Contrato mínimo de una base de datos SQL.
 * Lo implementan el adaptador de Capacitor (SQLite real en Android/iOS y en la web con SQL.js)
 * y, en las pruebas, un adaptador sobre SQL.js. Así la lógica de datos no depende del plugin.
 */
export interface SqlDb {
  /** Ejecuta una o varias sentencias sin parámetros (esquema, migraciones). */
  execute(sql: string): Promise<void>;
  /** Ejecuta una sentencia con parámetros (INSERT, UPDATE, DELETE). */
  run(sql: string, params?: unknown[]): Promise<void>;
  /** Lanza una consulta y devuelve las filas como objetos. */
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
}
