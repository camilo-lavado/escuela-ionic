import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { defineCustomElements as defineJeepSqlite } from 'jeep-sqlite/loader';

import { SqlDb } from './sql-db';

/**
 * Adaptador de @capacitor-community/sqlite.
 * - Android / iOS: SQLite nativo.
 * - Web: SQLite compilado a WebAssembly (SQL.js) mediante el componente <jeep-sqlite>,
 *   que guarda la base de datos en IndexedDB. Requiere servir `sql-wasm.wasm` en /assets
 *   (se copia en angular.json desde node_modules/sql.js).
 */
export class CapacitorSqlDb implements SqlDb {
  private saveTimer?: ReturnType<typeof setTimeout>;

  private constructor(
    private readonly sqlite: SQLiteConnection,
    private readonly conn: SQLiteDBConnection,
    private readonly name: string,
    private readonly web: boolean,
  ) {}

  static async open(name: string): Promise<CapacitorSqlDb> {
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    const web = Capacitor.getPlatform() === 'web';

    if (web) {
      defineJeepSqlite(window);
      if (!document.querySelector('jeep-sqlite')) {
        const el = document.createElement('jeep-sqlite');
        el.setAttribute('autoSave', 'true');
        document.body.appendChild(el);
      }
      await customElements.whenDefined('jeep-sqlite');
      await sqlite.initWebStore();
    }

    // Reutiliza la conexión si ya existe (p. ej. recarga en caliente)
    const consistent = (await sqlite.checkConnectionsConsistency()).result;
    const exists = (await sqlite.isConnection(name, false)).result;
    const conn =
      consistent && exists
        ? await sqlite.retrieveConnection(name, false)
        : await sqlite.createConnection(name, false, 'no-encryption', 1, false);
    await conn.open();
    return new CapacitorSqlDb(sqlite, conn, name, web);
  }

  async execute(sql: string): Promise<void> {
    await this.conn.execute(sql);
    this.persist();
  }

  async run(sql: string, params: unknown[] = []): Promise<void> {
    await this.conn.run(sql, params as unknown[]);
    this.persist();
  }

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const res = await this.conn.query(sql, params as unknown[]);
    // En iOS la primera fila puede traer los nombres de columna (ios_columns): se descarta
    return ((res.values ?? []) as Record<string, unknown>[]).filter((r) => !('ios_columns' in r)) as T[];
  }

  /** En la web fuerza el guardado en IndexedDB (agrupando escrituras seguidas). */
  private persist(): void {
    if (!this.web) return;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.sqlite.saveToStore(this.name).catch((e) => console.warn('No se pudo guardar en IndexedDB', e));
    }, 250);
  }
}
